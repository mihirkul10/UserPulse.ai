import OpenAI from 'openai';
import pLimit from 'p-limit';
import { UnifiedItem, AnalyzeInput, CoverageMeta, ContextPack, ReportSections } from './types';

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    // Initializing OpenAI client
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// (Prompt selection helper removed to preserve full prompt quality)

// Helper function to safely call OpenAI API with proper error handling
async function callOpenAI(messages: any[], functionName: string) {
  try {
    const ai = getOpenAI();
    const model = process.env.OPENAI_MODEL || 'gpt-5-nano-2025-08-07';
    
    console.log(`[${functionName}] Calling OpenAI with model: ${model}`);
    
    // Use appropriate parameters based on model
    const params: any = {
      model: model,
      messages: messages,
    };
    
    // Parameter compatibility per model family
    if (model.startsWith('gpt-5-nano')) {
      // gpt-5-nano requires max_completion_tokens and default temperature only
      params.max_completion_tokens = 4000;
    } else if (model.includes('gpt-4') || model.includes('gpt-3')) {
      params.max_tokens = 4000;
      params.temperature = 0.7;
    } else {
      // Fallback: try completion tokens
      params.max_completion_tokens = 4000;
    }
    
    const response = await ai.chat.completions.create(params);
    
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      console.error(`[${functionName}] OpenAI returned empty response`);
      return null;
    }
    
    // Check if the response is an error message (not JSON)
    if (content.toLowerCase().startsWith('an error') || 
        content.toLowerCase().startsWith('error:') ||
        content.toLowerCase().includes('api key') ||
        content.toLowerCase().includes('unauthorized')) {
      console.error(`[${functionName}] OpenAI returned error message:`, content);
      return null;
    }
    
    return content;
  } catch (error: any) {
    console.error(`[${functionName}] OpenAI API call failed:`, error);
    
    // Log specific error details
    if (error?.response?.status === 401) {
      console.error('Authentication failed - check your API key');
    } else if (error?.response?.status === 429) {
      console.error('Rate limit exceeded - too many requests');
    } else if (error?.response?.status === 500) {
      console.error('OpenAI server error');
    } else if (error?.code === 'ECONNREFUSED') {
      console.error('Network error - cannot connect to OpenAI');
    }
    
    return null;
  }
}

export async function generateEntityResolution(
  productName: string
): Promise<string[]> {
  const prompt = `Generate search query variants for Reddit search for product: "${productName}"

CRITICAL: Return ONLY a valid JSON array of strings. No explanations, no markdown, just the JSON array.

Include variations like:
- Exact name
- Lowercase version  
- Common abbreviations
- Alternative names
- With/without spaces/hyphens

Product: ${productName}`;

  const content = await callOpenAI([
    { role: 'system', content: 'You are a JSON-only assistant. Always respond with valid JSON arrays and nothing else.' },
    { role: 'user', content: prompt }
  ], 'generateEntityResolution');

  if (!content) {
    console.log(`[generateEntityResolution] Using fallback for ${productName}`);
    return [productName, productName.toLowerCase()];
  }

  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    // Check if content looks like JSON
    if (!cleanContent.startsWith('[') && !cleanContent.startsWith('{')) {
      console.error('[generateEntityResolution] Response is not JSON:', cleanContent.substring(0, 100));
      return [productName, productName.toLowerCase()];
    }
    
    const result = JSON.parse(cleanContent);
    console.log(`[generateEntityResolution] Successfully parsed ${result.length} variants`);
    return result;
  } catch (error) {
    console.error('[generateEntityResolution] JSON parse failed:', error);
    return [productName, productName.toLowerCase()];
  }
}

interface ItemForRelevance {
  title_or_text: string;
}

export async function filterForRelevance(
  items: ItemForRelevance[],
  productName: string
): Promise<ItemForRelevance[]> {
  if (items.length === 0) return [];
  
  const prompt = `Filter Reddit posts/comments for items related to ${productName} or its competitors.

BE VERY INCLUSIVE - include items about product mentions, comparisons, user experiences, bugs, pricing, etc.

Items:
${items.map((item, i) => `${i}: ${item.title_or_text?.substring(0, 200)}...`).join('\n')}

CRITICAL: Return ONLY a JSON array of indices. No explanations. Example: [0,1,2,3,4]`;

  const content = await callOpenAI([
    { role: 'system', content: 'You are a JSON-only assistant. Always respond with valid JSON arrays and nothing else.' },
    { role: 'user', content: prompt }
  ], 'filterForRelevance');

  if (!content) {
    console.log('[filterForRelevance] Using all items due to API failure');
    return items; // Include all items if API fails
  }

  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    // Check if content looks like JSON
    if (!cleanContent.startsWith('[')) {
      console.error('[filterForRelevance] Response is not JSON array:', cleanContent.substring(0, 100));
      return items;
    }
    
    const indices = JSON.parse(cleanContent);
    const filtered = indices.map((i: number) => items[i]).filter(Boolean);
    console.log(`[filterForRelevance] Filtered to ${filtered.length} items`);
    return filtered;
  } catch (error) {
    console.error('[filterForRelevance] JSON parse failed:', error);
    return items;
  }
}

export async function classifyAspects(
  items: UnifiedItem[],
  competitor: string
): Promise<UnifiedItem[]> {
  if (items.length === 0) return [];
  
  const prompt = `Classify these Reddit items about ${competitor} into aspects.

Categories: launch, performance, reliability, dx, pricing, integration, support, comparison, love, notlove, feature

Items:
${items.map((item, i) => `${i}: ${item.title_or_text?.substring(0, 150)}...`).join('\n')}

CRITICAL: Return ONLY a JSON array of objects: [{"aspect": "love"}, {"aspect": "performance"}, ...]`;

  const content = await callOpenAI([
    { role: 'system', content: 'You are a JSON-only assistant. Always respond with valid JSON arrays and nothing else.' },
    { role: 'user', content: prompt }
  ], 'classifyAspects');

  if (!content) {
    console.log(`[classifyAspects] Using default aspects for ${competitor}`);
    return items.map(item => ({ ...item, aspect: 'love' as const }));
  }

  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    // Check if content looks like JSON
    if (!cleanContent.startsWith('[')) {
      console.error('[classifyAspects] Response is not JSON array:', cleanContent.substring(0, 100));
      return items.map(item => ({ ...item, aspect: 'love' as const }));
    }
    
    const classifications = JSON.parse(cleanContent);
    
    return items.map((item, i) => ({
      ...item,
      aspect: classifications[i]?.aspect || 'love'
    }));
  } catch (error) {
    console.error('[classifyAspects] JSON parse failed:', error);
    return items.map(item => ({ ...item, aspect: 'love' as const }));
  }
}

export const REPORT_SYSTEM_PROMPT_V2 = `
You are writing directly to a founder who needs competitive intelligence. Write in first person, giving direct recommendations based on Reddit discussions.

TONE & STYLE:
- First person, direct recommendations ("I recommend...", "You should consider...", "I noticed...")
- Conversational but professional
- DETAILED insights that summarize what users are actually saying
- Every claim MUST have Reddit permalinks as evidence

OUTPUT FORMAT (exactly this structure with proper spacing):

# **Competitive Intelligence Report**

---

## **Your Product: [Product Name]**

### **📊 What Users Are Saying**

**Positive Feedback:**
• **[Feature/Aspect]**: [2-3 sentences summarizing user sentiment with specific examples]
  [ref](reddit_permalink) | [ref](reddit_permalink)

**Pain Points:**
• **[Issue/Problem]**: [2-3 sentences detailing the specific complaint and context]
  [ref](reddit_permalink) | [ref](reddit_permalink)

---

## **Competitor Analysis**

### **[Competitor Name]**

#### **🚀 New Updates**
• **[Feature/Update Name]** *(launched [date])*
  [Detailed 2-3 sentence description of what launched, how users are reacting, and any notable quotes]
  [ref](reddit_permalink) | [ref](reddit_permalink) | [ref](reddit_permalink)

#### **💚 What Users Love**
• **[Feature/Aspect]**
  [2-3 sentences summarizing WHY users love this, with specific examples from posts. Include a short quote if powerful]
  *"[quote under 20 words]"* - r/[subreddit]
  [ref](reddit_permalink) | [ref](reddit_permalink)

#### **⚠️ What Users Dislike**
• **[Problem/Issue]**
  [2-3 sentences explaining the problem in detail, how it affects users, frequency of complaints]
  Common complaint: *"[short quote]"*
  [ref](reddit_permalink) | [ref](reddit_permalink) | [ref](reddit_permalink)

---

[Repeat competitor section for each competitor with same formatting]

---

## **💡 Strategic Takeaways**

Based on analyzing both your product feedback and competitor insights:

**1. [Strategic Theme]**
   I recommend [specific action] because [detailed reasoning connecting your product feedback to competitor patterns]. Users specifically mentioned [example].

**2. [Strategic Theme]**
   You should consider [specific strategy] given that [observation about market]. Your users are asking for [X] while competitor users complain about [Y].

**3. [Strategic Theme]**
   I noticed [pattern across products] which suggests [recommendation]. This represents an opportunity because [reasoning].

**Quick Wins:**
• [Immediate action 1 based on competitor weaknesses]
• [Immediate action 2 based on user requests]
• [Immediate action 3 based on market gaps]

---

*Report generated from [X] Reddit discussions across [Y] subreddits over [Z] days*

FORMATTING RULES:
- Use --- for section separators
- Use emoji icons for section headers (🚀 💚 ⚠️ 📊 💡)
- Format links as [ref](url) with pipe separators
- Include bullet points with • character
- Add proper spacing between sections
- Use **bold** for emphasis
- Use *italics* for quotes and metadata

CONTENT RULES:
- Each insight must be 2-3 sentences minimum explaining the DETAILS
- Include specific examples from posts
- Add context about frequency, severity, user types
- Quote actual user language when impactful
- Connect insights across products in takeaways
- Be specific about dates, versions, features, errors
`;

export const REPORT_FEW_SHOT_CLARITY = `
EXAMPLE (structure, tone, and formatting):

### **GitHub Copilot**

#### **🚀 New Updates**
• **Copilot Chat GA** *(launched Dec 2024)*
  GitHub released multi-file context understanding in VS Code, allowing Copilot to analyze entire project structures. Users are reporting 40% better suggestions and praising the workspace-aware completions. The feature rolled out to all paid tiers without additional cost.
  [ref](https://reddit.com/r/vscode/comments/xxx) | [ref](https://reddit.com/r/programming/comments/yyy) | [ref](https://reddit.com/r/webdev/comments/zzz)

#### **💚 What Users Love**
• **Multi-file Context Understanding**
  Developers are thrilled that Copilot finally understands relationships between files, especially in large codebases. Users report it now suggests imports correctly and understands custom types across files. One senior dev mentioned it "feels like pair programming with someone who actually knows my codebase."
  *"Finally understands my entire React project structure!"* - r/reactjs
  [ref](https://reddit.com/r/webdev/comments/aaa) | [ref](https://reddit.com/r/node/comments/bbb)

#### **⚠️ What Users Dislike**
• **Pricing for Individual Developers**
  The $19/month price point is causing significant pushback from indie developers and students. Multiple threads show users comparing it unfavorably to ChatGPT Plus at $20. The lack of a hobbyist tier is mentioned repeatedly.
  Common complaint: *"Too expensive for side projects"*
  [ref](https://reddit.com/r/programming/comments/ccc) | [ref](https://reddit.com/r/startups/comments/ddd) | [ref](https://reddit.com/r/learnprogramming/comments/eee)
`;

// System prompt for generating ONLY a single competitor section
export const REPORT_SECTION_SYSTEM = (
  productName: string,
) => `You are composing ONE section of a competitive intelligence report.

Write ONLY the section for ${productName}. Do not include the global report header, "Your Product" section, or strategic takeaways. Do not repeat other competitors.

FORMAT EXACTLY:

### **${productName}**

#### **🚀 New Updates**
• [Bullet with 2–3 sentences and refs]

#### **💚 What Users Love**
• [Bullet with 2–3 sentences and refs]

#### **⚠️ What Users Dislike**
• [Bullet with 2–3 sentences and refs]

Rules:
- Use [ref](url) links from the provided items.
- No top-level headings, no summary, no takeaways. Only this competitor's section.`;

function buildSectionPrompt(productName: string, items: UnifiedItem[]) {
  const payload = {
    product: productName,
    items: items.slice(0, 80).map(i => ({
      type: i.type,
      subreddit: i.subreddit,
      score: i.score,
      dateUTC: i.created_at,
      text: i.title_or_text?.slice(0, 400),
      permalink: i.thread_url,
      outbound_urls: i.evidence_urls?.slice(0, 4)
    }))
  };
  return `DATA (JSON):\n${JSON.stringify(payload, null, 2)}\n\nWrite the section described above for ${productName}.`;
}

export function buildUserPromptV2(
  unified: UnifiedItem[],
  input: AnalyzeInput,
  coverage: CoverageMeta
) {
  // Group items by product (including founder's product)
  const productGroups: { [key: string]: Array<{
    type: string;
    aspect: string;
    subreddit: string;
    score: number;
    num_comments: number;
    dateUTC: string;
    title_or_text: string;
    permalink: string;
    outbound_urls: string[];
  }> } = {};
  
  unified.slice(0, 250).forEach(item => {
    const product = item.matchedCompetitor;
    if (!productGroups[product]) {
      productGroups[product] = [];
    }
    productGroups[product].push({
      type: item.type,
      aspect: item.aspect ?? 'general',
      subreddit: item.subreddit,
      score: item.score,
      num_comments: item.num_comments ?? 0,
      dateUTC: item.created_at,
      title_or_text: item.title_or_text?.slice(0, 400),
      permalink: item.thread_url,
      outbound_urls: item.evidence_urls?.slice(0, 4)
    });
  });

  // Separate founder's product data from competitors
  const founderProductData = productGroups[input.me.name] || [];
  const competitorData: { [key: string]: Array<{
    type: string;
    aspect: string;
    subreddit: string;
    score: number;
    num_comments: number;
    dateUTC: string;
    title_or_text: string;
    permalink: string;
    outbound_urls: string[];
  }> } = {};
  
  input.competitors.forEach(comp => {
    if (productGroups[comp.name]) {
      competitorData[comp.name] = productGroups[comp.name];
    }
  });

  const payload = {
    me: input.me.name,
    competitors: input.competitors.map(c => c.name).filter(Boolean),
    days: input.days,
    coverage: {
      items_used: coverage.totalItemsUsed,
      subs_used: coverage.subredditsUsed,
      threads_total: coverage.totalThreads
    },
    founder_product_data: founderProductData,
    competitor_data: competitorData
  };

  return `
DATA (JSON):
${JSON.stringify(payload, null, 2)}

INSTRUCTIONS FOR REPORT GENERATION:

1. **Your Product Section** (use founder_product_data):
   - Analyze what users are saying about the founder's product "${input.me.name}"
   - Separate into Positive Feedback and Pain Points
   - Be honest but constructive about criticism
   - Provide 2-3 sentences of context for each insight

2. **Competitor Analysis** (use competitor_data):
   - For each competitor, create detailed sections:
   - **New Updates**: Launches, releases, versions with dates and user reactions
   - **What Users Love**: WHY users appreciate features, with examples and quotes
   - **What Users Dislike**: Detailed pain points, frequency, severity

3. **Strategic Takeaways**:
   - Compare founder's product feedback with competitor insights
   - Identify opportunities where competitors are weak but founder's users want features
   - Suggest improvements based on what works for competitors
   - Highlight competitive advantages the founder already has

4. **Formatting Requirements**:
   - Use [ref](url) format for links with pipe | separators
   - Include 2-3 sentences minimum per insight explaining context
   - Add powerful quotes in italics
   - Use emojis for section headers
   - Add --- separators between major sections

5. **Content Depth**:
   - Don't just list features - explain WHY users care
   - Include frequency (how often mentioned)
   - Add severity for problems (minor annoyance vs dealbreaker)
   - Quote actual user language when impactful
   - Mention specific subreddits for context

Remember: Be detailed and specific. The founder needs to understand not just WHAT users think, but WHY they think it.
`;
}

export async function writeReportV2(
  unified: UnifiedItem[],
  input: AnalyzeInput,
  coverage: CoverageMeta
): Promise<string> {
  console.log('[writeReportV2] Starting report generation (sectioned mode)...');

  // Build header first
  const header = `# **Competitive Intelligence Report**\n\n---\n\n## **Your Product: ${input.me.name}**\n`;

  // Group items by product
  const byProduct: Record<string, UnifiedItem[]> = {};
  for (const it of unified) {
    (byProduct[it.matchedCompetitor] ||= []).push(it);
  }

  const limit = pLimit(3); // control concurrency to avoid rate limits

  async function generateSection(productName: string, items: UnifiedItem[]): Promise<string> {
    const sys = REPORT_SECTION_SYSTEM(productName);
    const payload = buildSectionPrompt(productName, items);
    const clarity = undefined;
    const content = await callOpenAI([
      { role: 'system', content: sys },
      { role: 'user', content: payload }
    ], `section:${productName}`);
    if (!content) {
      // Minimal fallback for a single section
      return `### **${productName}**\n• Unable to retrieve detailed section within time limit.\n`;
    }
    return content;
  }

  const products = Array.from(new Set([input.me.name, ...input.competitors.map(c => c.name)])).filter(Boolean);
  const sectionPromises = products.map(name => limit(() => generateSection(name, byProduct[name] || [])));
  const sections = await Promise.all(sectionPromises);

  // Generate strategic takeaways in a small separate call
  const takeawaysPrompt = `DATA:\n${JSON.stringify({ products, coverage }, null, 2)}\n\nWrite a concise 'Strategic Takeaways' section (3 bullets) connecting themes across products.`;
  const takeaways = await callOpenAI([
    { role: 'system', content: 'You write concise, actionable strategy bullets.' },
    { role: 'user', content: takeawaysPrompt }
  ], 'takeaways');

  const final = [
    header,
    '## **Competitor Analysis**',
    '',
    sections.join('\n\n---\n\n'),
    '\n---\n',
    takeaways ? takeaways : '## **💡 Strategic Takeaways**\n• Focus on recurring pain points.\n• Amplify strengths users praise.\n• Track competitor launches closely.'
  ].join('\n');

  return final;
}

export async function writeReport(
  unified: UnifiedItem[],
  input: AnalyzeInput,
  coverage: CoverageMeta,
  _contextPack: ContextPack
): Promise<ReportSections> {
  // Use the new V2 writer for better structure and evidence linking
  const markdown = await writeReportV2(unified, input, coverage);
  
  // For the new format, we'll return the markdown directly
  // The sections are now organized per-competitor, so traditional section parsing doesn't apply
  const sections: ReportSections = {
    header: '# **Competitive Intelligence Report**\n\n',
    launches: '', // These will be embedded in each competitor section
    loving: '',   // These will be embedded in each competitor section
    notLoving: '', // These will be embedded in each competitor section
    strategicRead: '', // No longer used in new format
    takeaways: '',  // This will be extracted from the Takeaways section
    appendixCsv: generateAppendixCsv(unified),
    raw: markdown  // Add raw markdown for direct display
  };
  
  // Extract just the Takeaways section if it exists
  const takeawaysMatch = markdown.match(/## \*\*💡 Strategic Takeaways\*\*[\s\S]*/);
  if (takeawaysMatch) {
    sections.takeaways = takeawaysMatch[0];
  }
  
  return sections;
}

export async function generateProductContext(product: { name: string }): Promise<ContextPack> {
  console.log('[generateProductContext] Generating context for:', product.name);
  
  const prompt = `You are a product research assistant. Generate a context summary for the product "${product.name}".

CRITICAL: You MUST respond with ONLY valid JSON in this exact format:
{"contextText": "brief description of what this product does, its key features and target audience", "keywords": ["keyword1", "keyword2", "keyword3"]}

Do not include any other text, explanations, or markdown formatting. Just the JSON object.

Product: ${product.name}`;

  const content = await callOpenAI([
    { role: 'system', content: 'You are a JSON-only assistant. Always respond with valid JSON and nothing else.' },
    { role: 'user', content: prompt }
  ], 'generateProductContext');

  if (!content) {
    console.log('[generateProductContext] Using fallback context');
    return {
      contextText: `${product.name} is a software product that provides solutions for users.`,
      keywords: [product.name, product.name.toLowerCase()]
    };
  }

  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    // Check if content looks like JSON
    if (!cleanContent.startsWith('{')) {
      console.error('[generateProductContext] Response is not JSON object:', cleanContent.substring(0, 100));
      return {
        contextText: `${product.name} is a software product that provides solutions for users.`,
        keywords: [product.name, product.name.toLowerCase()]
      };
    }
    
    const result = JSON.parse(cleanContent);
    console.log('[generateProductContext] Successfully parsed context');
    return result;
  } catch (error) {
    console.error('[generateProductContext] JSON parse failed:', error);
    return {
      contextText: `${product.name} is a software product that provides solutions for users.`,
      keywords: [product.name, product.name.toLowerCase()]
    };
  }
}

function generateAppendixCsv(items: UnifiedItem[]): string {
  const headers = ['Competitor', 'Aspect', 'User Feedback', 'Score', 'Subreddit', 'Thread Link', 'Evidence URLs'];
  const rows = items.slice(0, 50).map(item => [
    item.matchedCompetitor,
    item.aspect || 'general',
    `"${item.title_or_text.replace(/"/g, '""').replace(/\n+/g, ' ').substring(0, 200)}..."`,
    item.score.toString(),
    `r/${item.subreddit}`,
    item.thread_url,
    item.evidence_urls.join('; ')
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}