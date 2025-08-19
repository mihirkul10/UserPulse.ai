import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';

export interface ScrapedProductInfo {
  name: string;
  description: string;
  features: string[];
  category: string;
  targetAudience: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    console.log(`[scrape] Scraping ${url}...`);
    
    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UserPulse-AI/1.0; +https://userpulse.ai)',
      },
    });
    
    if (!response.ok) {
      console.error(`[scrape] Failed to fetch ${url}: ${response.status}`);
      return NextResponse.json({ error: `Failed to fetch webpage: ${response.status}` }, { status: 400 });
    }
    
    const html = await response.text();
    
    // Extract text content from HTML
    const textContent = extractTextFromHTML(html);
    
    // Use AI to analyze the webpage content
    const analysisPrompt = `
Analyze this product webpage content and extract structured information:

WEBPAGE CONTENT:
${textContent.slice(0, 4000)}

Extract and return ONLY a JSON object with this structure:
{
  "name": "actual product name from the page",
  "description": "2-3 sentence description of what the product does",
  "features": ["feature 1", "feature 2", "feature 3"],
  "category": "product category (e.g., 'AI Development Tool', 'SaaS Platform', etc.)",
  "targetAudience": "who uses this product"
}

Be accurate and specific. Extract real information from the webpage, don't make assumptions.
`;

    const ai = getOpenAI();
    const aiResponse = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You are a web content analyzer. Always respond with valid JSON only.' },
        { role: 'user', content: analysisPrompt }
      ]
    });
    
    const result = aiResponse.choices[0]?.message?.content;
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to analyze webpage content' }, { status: 500 });
    }
    
    try {
      const cleanResult = result.replace(/```json\n?|\n?```/g, '').trim();
      const productInfo: ScrapedProductInfo = JSON.parse(cleanResult);
      
      console.log(`[scrape] Successfully extracted info for ${productInfo.name}`);
      
      // Generate enhanced context and keywords
      const contextText = `${productInfo.name} is a ${productInfo.category.toLowerCase()} that ${productInfo.description} Key features include ${productInfo.features.join(', ')}. Target audience includes ${productInfo.targetAudience}.`;
      
      const keywords = [
        productInfo.name,
        productInfo.name.toLowerCase(),
        ...productInfo.features.map(f => f.toLowerCase()),
        productInfo.category.toLowerCase(),
        ...productInfo.targetAudience.toLowerCase().split(' ')
      ].filter((k, i, arr) => k && k.length > 2 && arr.indexOf(k) === i); // Remove duplicates and short words
      
      return NextResponse.json({
        productInfo,
        contextText,
        keywords
      });
      
    } catch (parseError) {
      console.error(`[scrape] Failed to parse AI response:`, result);
      return NextResponse.json({ error: 'Failed to parse extracted information' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[scrape] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Simple HTML to text extraction
 */
function extractTextFromHTML(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}
