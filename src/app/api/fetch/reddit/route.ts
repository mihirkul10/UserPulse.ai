export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import snoowrap from 'snoowrap';
import pLimit from 'p-limit';
import dayjs from 'dayjs';
import { AnalyzeInput, RawItem } from '@/lib/types';
import { generateEntityResolution, filterForRelevance } from '@/lib/openai';

const RequestSchema = z.object({
  me: z.object({
    name: z.string(),
  }),
  competitors: z.array(z.object({
    name: z.string(),
  })).min(1).max(3),
  days: z.number().default(30),
  minScoreReddit: z.number().default(5),
  maxThreads: z.number().default(250),
  langs: z.array(z.string()).default(['en']),
  subreddits: z.array(z.string()),
  meContext: z.object({
    contextText: z.string(),
    keywords: z.array(z.string()),
  }),
});

function initReddit() {
  console.log('Initializing Reddit client...');
  console.log('Reddit credentials check:', {
    userAgent: process.env.REDDIT_USER_AGENT ? 'Set' : 'Missing',
    clientId: process.env.REDDIT_CLIENT_ID ? 'Set' : 'Missing',
    clientSecret: process.env.REDDIT_CLIENT_SECRET ? 'Set' : 'Missing',
    username: process.env.REDDIT_USERNAME ? 'Set' : 'Missing',
    password: process.env.REDDIT_PASSWORD ? 'Set' : 'Missing',
  });
  
  return new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT || 'competitor-insight/1.0',
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    username: process.env.REDDIT_USERNAME!,
    password: process.env.REDDIT_PASSWORD!,
  });
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const urls = text.match(urlRegex) || [];
  
  return urls.filter(url => {
    const lowercaseUrl = url.toLowerCase();
    return (
      lowercaseUrl.includes('github.com') ||
      lowercaseUrl.includes('/blog/') ||
      lowercaseUrl.includes('/docs/') ||
      lowercaseUrl.includes('/changelog') ||
      lowercaseUrl.includes('medium.com') ||
      lowercaseUrl.includes('substack.com')
    );
  });
}

async function searchRedditForCompetitor(
  reddit: snoowrap,
  competitor: { name: string },
  input: AnalyzeInput
): Promise<RawItem[]> {
  console.log(`Searching Reddit for competitor: ${competitor.name}`);
  
  // Generate search variants using LLM
  const searchVariants = await generateEntityResolution(competitor.name);
  console.log(`Generated ${searchVariants.length} search variants for ${competitor.name}`);
  
  const allItems: RawItem[] = [];
  // Increase concurrency for faster mining
  const limit = pLimit(5);
  const cutoffDate = dayjs().subtract(input.days, 'day').unix();
  
  // Search ALL subreddits, not just first 20
  const searchPromises = input.subreddits.map(subreddit => 
    limit(async () => {
      try {
        console.log(`Searching r/${subreddit} for ${competitor.name}`);
        
        // Use more search variants for better coverage
        const query = searchVariants.slice(0, 5).map(v => `"${v}"`).join(' OR ');
        const searchResults = await reddit.getSubreddit(subreddit).search({
          query,
          sort: 'new',
          time: 'month',
        });
        // Get more posts for better coverage
        const posts = searchResults.slice(0, 50);
        
        console.log(`Found ${posts.length} posts in r/${subreddit}`);
        
        for (const post of posts) {
          // Be more lenient with filtering to get more data
          if (post.created_utc < cutoffDate) continue;
          // Accept posts with 0 score if they have comments (engagement)
          if (post.score < input.minScoreReddit && post.num_comments < 3) continue;
          
          const evidenceUrls = extractUrls(post.selftext || '');
          
          const item: RawItem = {
            id: post.id,
            type: 'post',
            author: post.author.name,
            subreddit,
            title_or_text: post.title + (post.selftext ? '\n\n' + post.selftext.substring(0, 500) : ''),
            url: post.url !== post.permalink ? post.url : undefined,
            thread_url: `https://reddit.com${post.permalink}`,
            created_at: new Date(post.created_utc * 1000).toISOString(),
            score: post.score,
            num_comments: post.num_comments,
            evidence_urls: evidenceUrls,
            matchedCompetitor: competitor.name,
          };
          
          allItems.push(item);
          
          // Get top comments for high-engagement posts
          if (post.num_comments > 5 && allItems.length < input.maxThreads) {
            try {
              const comments = await post.comments.fetchAll();
              
              // Get more comments for richer insights
              for (const comment of comments.slice(0, 20)) {
                // Accept all comments with any engagement
                if (comment.score < 0) continue;
                
                const commentEvidenceUrls = extractUrls(comment.body || '');
                
                const commentItem: RawItem = {
                  id: comment.id,
                  type: 'comment',
                  author: comment.author?.name || 'deleted',
                  subreddit,
                  title_or_text: comment.body?.substring(0, 500) || '',
                  thread_url: `https://reddit.com${post.permalink}${comment.id}/`,
                  created_at: new Date(comment.created_utc * 1000).toISOString(),
                  score: comment.score,
                  evidence_urls: commentEvidenceUrls,
                  matchedCompetitor: competitor.name,
                };
                
                allItems.push(commentItem);
              }
            } catch (error) {
              console.log('Error fetching comments:', error);
            }
          }
        }
      } catch (error) {
        console.log(`Error searching r/${subreddit}:`, error);
      }
    })
  );
  
  await Promise.all(searchPromises);
  
  // Filter for relevance using LLM
  const relevantItems = await filterForRelevance(allItems, competitor.name) as RawItem[];
  
  console.log(`Found ${relevantItems.length} relevant items for ${competitor.name}`);
  return relevantItems;
}

export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET || 
        !process.env.REDDIT_USERNAME || !process.env.REDDIT_PASSWORD) {
      return NextResponse.json(
        { error: 'Reddit API credentials not configured. Please check environment variables.' },
        { status: 500 }
      );
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please check environment variables.' },
        { status: 500 }
      );
    }
    const body = await request.json();
    const input = RequestSchema.parse(body);
    
    const reddit = initReddit();
    const allItems: RawItem[] = [];
    
    // Search for each competitor
    for (const competitor of input.competitors) {
      const competitorItems = await searchRedditForCompetitor(reddit, competitor, input);
      allItems.push(...competitorItems);
    }
    
    // Sort by score and recency
    allItems.sort((a, b) => {
      const scoreA = a.score * (1 + Math.max(0, dayjs().diff(dayjs(a.created_at), 'day')) / 30);
      const scoreB = b.score * (1 + Math.max(0, dayjs().diff(dayjs(b.created_at), 'day')) / 30);
      return scoreB - scoreA;
    });
    
    // Limit results
    const limitedItems = allItems.slice(0, input.maxThreads);
    
    console.log(`Returning ${limitedItems.length} total items`);
    return NextResponse.json(limitedItems);
    
  } catch (error) {
    console.error('Error in fetch reddit route:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Reddit data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
