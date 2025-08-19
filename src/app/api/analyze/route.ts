export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60; // ask Vercel for the plan’s max (Pro = 60s)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dayjs from 'dayjs';
import { uniqBy, groupBy } from 'lodash';
import levenshtein from 'fast-levenshtein';
import { RawItem, UnifiedItem, CoverageMeta } from '@/lib/types';
import { classifyAspects, writeReport, writeReportV2 } from '@/lib/openai';

const RequestSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    type: z.enum(['post', 'comment']),
    author: z.string(),
    subreddit: z.string(),
    title_or_text: z.string(),
    url: z.string().optional(),
    thread_url: z.string(),
    created_at: z.string(),
    score: z.number(),
    num_comments: z.number().optional(),
    evidence_urls: z.array(z.string()),
    matchedCompetitor: z.string(),
  })),
  input: z.object({
    me: z.object({
      name: z.string(),
      url: z.string().optional(),
      twitterHandle: z.string().optional(),
    }),
    competitors: z.array(z.object({
      name: z.string(),
      url: z.string().optional(),
      twitterHandle: z.string().optional(),
    })),
    days: z.number(),
    minScoreReddit: z.number(),
    maxThreads: z.number(),
    langs: z.array(z.string()),
    subreddits: z.array(z.string()),
  }),
  meContext: z.object({
    contextText: z.string(),
    keywords: z.array(z.string()),
  }),
});

function deduplicateItems(items: RawItem[]): RawItem[] {
  // Remove exact duplicates by ID
  const uniqueById = uniqBy(items, 'id');
  
  // Group by competitor for fuzzy dedup
  const grouped = groupBy(uniqueById, 'matchedCompetitor');
  const deduplicated: RawItem[] = [];
  
  for (const [, competitorItems] of Object.entries(grouped)) {
    const seen = new Set<string>();
    
    for (const item of competitorItems) {
      // Check for fuzzy duplicates
      const text = item.title_or_text.toLowerCase();
      let isDuplicate = false;
      
      for (const seenText of seen) {
        if (levenshtein.get(text, seenText) < Math.min(text.length, seenText.length) * 0.2) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        seen.add(text);
        deduplicated.push(item);
      }
    }
  }
  
  return deduplicated;
}

function calculateRankScore(item: RawItem): number {
  const now = dayjs();
  const created = dayjs(item.created_at);
  const hoursAge = now.diff(created, 'hour');
  const daysAge = now.diff(created, 'day');
  
  // Freshness: exponential decay with 7-day half-life
  const freshness = Math.exp(-daysAge * Math.log(2) / 7);
  
  // Velocity: (score + comments) per hour
  const velocity = (item.score + (item.num_comments || 0)) / Math.max(1, hoursAge);
  
  // Engagement quality: boost for high-score items
  const engQuality = Math.min(1, item.score / 20);
  
  // Evidence boost: presence of primary links
  const evidence = item.evidence_urls.length > 0 ? 0.2 : 0;
  
  // Author credibility: basic heuristic
  const authorCred = item.author.toLowerCase().includes('official') ? 0.1 : 0;
  
  return (
    0.40 * freshness +
    0.25 * Math.min(1, velocity / 10) +
    0.20 * engQuality +
    0.10 * evidence +
    0.05 * authorCred
  );
}

export async function POST(request: NextRequest) {
  try {
    // Soft timeout guard (45s) to ensure we always return JSON on serverless platforms
    const abortController = new AbortController();
    const softTimeout = setTimeout(() => {
      try { abortController.abort(); } catch {}
    }, 45_000);

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please check environment variables.' },
        { status: 500 }
      );
    }
    const body = await request.json();
    const { items, input, meContext } = RequestSchema.parse(body);
    
    console.log(`Starting analysis of ${items.length} items`);
    
    // Deduplicate items
    const dedupedItems = deduplicateItems(items);
    console.log(`After deduplication: ${dedupedItems.length} items`);
    
    // Calculate ranking scores
    const rankedItems: UnifiedItem[] = dedupedItems.map(item => ({
      ...item,
      rankScore: calculateRankScore(item),
    }));
    
    // Sort by rank score
    rankedItems.sort((a, b) => b.rankScore - a.rankScore);
    
    // Classify aspects per competitor using LLM
    const grouped = groupBy(rankedItems, 'matchedCompetitor');
    const classifiedItems: UnifiedItem[] = [];
    
    for (const [competitorName, competitorItems] of Object.entries(grouped)) {
      console.log(`Classifying ${competitorItems.length} items for ${competitorName}`);
      const classified = await classifyAspects(competitorItems, competitorName);
      classifiedItems.push(...classified);
    }
    
    // Generate coverage metadata
    const coverage: CoverageMeta = {
      days: input.days,
      totalThreads: items.filter(item => item.type === 'post').length,
      totalComments: items.filter(item => item.type === 'comment').length,
      totalItemsUsed: classifiedItems.length,
      subredditsUsed: new Set(items.map(item => item.subreddit)).size,
    };
    
    console.log('Generating report with LLM');
    console.log(`Report generation input: ${classifiedItems.length} items, ${input.competitors.length} competitors, ${input.days} days`);
    
    function hasRedditLinks(md: string) {
      // crude but effective: looks for reddit.com or /r/… permalink patterns
      const rx = /\(https?:\/\/(www\.)?reddit\.com\/[^\s)]+\)/gi;
      return (md.match(rx) || []).length >= 3; // expect multiple across sections
    }
    
    // Generate the final report using V2 writer
    const startTime = Date.now();
    console.log('Calling writeReportV2...');
    const markdown = await writeReportV2(classifiedItems, input, coverage);
    const endTime = Date.now();
    console.log(`Report generation completed in ${endTime - startTime}ms`);
    const finalMarkdown = hasRedditLinks(markdown)
      ? markdown
      : markdown + `\n\n> ⚠️ Evidence note: Fewer Reddit sources than expected. Consider widening the date window or lowering score thresholds.\n`;
    
    // Convert to legacy format for compatibility
    const report = await writeReport(classifiedItems, input, coverage, meContext);
    
    // Add the raw markdown to the report
    const enhancedReport = {
      ...report,
      raw: finalMarkdown
    };
    
    console.log('Analysis completed successfully');
    clearTimeout(softTimeout);

    return NextResponse.json({
      report: enhancedReport,
      coverage,
    });
    
  } catch (error) {
    console.error('Error in analyze route:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    // Always return structured JSON, even on unexpected failures
    return NextResponse.json({
      error: 'Failed to analyze data',
      hint: 'Try reducing the date range to 7–14 days or fewer competitors. If this persists on Vercel, the function may be timing out before returning JSON.',
    }, { status: 500 });
  }
}
