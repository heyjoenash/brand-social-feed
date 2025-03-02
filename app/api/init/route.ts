import { NextResponse } from 'next/server';
import { setupCronJob } from '../../../src/utils/cronSetup';
import { updatePostsFromApify } from '../../../src/utils/apifyFetcher';

let isInitialized = false;

export async function GET() {
  try {
    // Only initialize once
    if (!isInitialized) {
      // Always fetch real data from Apify
      await updatePostsFromApify().catch(err => {
        console.warn('Failed to fetch initial data from Apify:', err);
      });
      
      // Setup the cron job
      setupCronJob();
      
      isInitialized = true;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Initialization complete',
      isInitialized
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize' },
      { status: 500 }
    );
  }
} 