import { NextRequest, NextResponse } from 'next/server';
import { UFCScraper } from '@/lib/scraping/ufcScraper';

// Cache to prevent excessive scraping
const CACHE_DURATION = 3600000; // 1 hour
let cachedData: { data: any; timestamp: number } | null = null;

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      return NextResponse.json({ 
        ...cachedData.data,
        cached: true 
      });
    }

    // Perform fresh scrape
    const scraper = new UFCScraper();
    const result = await scraper.scrapeUpcomingFights();
    
    // Update cache
    cachedData = {
      data: result,
      timestamp: Date.now()
    };

    return NextResponse.json({ 
      ...result,
      cached: false 
    });
  } catch (error:any) {
    return NextResponse.json(
      { error: 'Failed to scrape UFC data', details: error.message },
      { status: 500 }
    );
  }
}