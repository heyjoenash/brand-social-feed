import { updatePostsFromApify } from '../../../../src/utils/apifyFetcher';
import { NextResponse } from 'next/server';

/**
 * Hourly cron job to refresh posts from Apify
 * This endpoint should be called every hour by Vercel Cron or an external cron service
 */
export async function GET() {
  try {
    console.log('Hourly cron job: Starting refresh...');
    
    // Check if we're within 5 minutes of the hour to avoid overlap with manual refreshes
    const now = new Date();
    const minutesPastHour = now.getMinutes();
    
    // Only run at the start of the hour (0-5 minutes past)
    if (minutesPastHour > 5) {
      console.log(`Hourly cron skipped: ${minutesPastHour} minutes past the hour`);
      return NextResponse.json({ 
        success: true, 
        message: 'Skipped refresh - not at the top of the hour',
        refreshed: false
      });
    }
    
    // Run the update
    const result = await updatePostsFromApify();
    
    console.log('Hourly cron job: Update completed', result);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.alreadyProcessed 
          ? 'Already up to date. No new posts to process.' 
          : `Posts refreshed successfully: ${result.message}`,
        runId: result.runId,
        newPosts: result.newPosts || 0,
        refreshed: !result.alreadyProcessed
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `Failed to refresh posts: ${result.message}`,
        refreshed: false
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Hourly cron job: Error refreshing posts', error);
    return NextResponse.json({ 
      success: false, 
      message: `Error refreshing posts: ${error instanceof Error ? error.message : String(error)}`,
      refreshed: false
    }, { status: 500 });
  }
} 