export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProductContext } from '@/lib/openai';

const ProductProfileSchema = z.object({
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = ProductProfileSchema.parse(body);

    // Generate context pack for the user's product
    const contextPack = await generateProductContext(product);

    return NextResponse.json(contextPack);
  } catch (error) {
    console.error('Error in mine context route:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate product context' },
      { status: 500 }
    );
  }
}
