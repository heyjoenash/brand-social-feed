import { NextResponse } from 'next/server';
import { updatePostsFromApify } from '../../../../src/utils/apifyFetcher';

// Prevent the API from timing out
export const maxDuration = 60; // 60 seconds timeout

export async function GET() {
  try {
    // Check for a secret key to prevent unauthorized access
    // (You'd normally add this for security)
    
    console.log('Cron job triggered - refreshing posts from Apify');
    const result = await updatePostsFromApify();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Posts refreshed successfully',
        runId: result.runId,
        newPosts: result.newPosts || 0,
        refreshed: !result.alreadyProcessed
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message || 'Failed to refresh posts'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in cron refresh:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error refreshing posts',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 