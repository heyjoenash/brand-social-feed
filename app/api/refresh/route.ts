import { NextResponse } from 'next/server';
import { updatePostsFromApify } from '../../../src/utils/apifyFetcher';

/**
 * API endpoint to refresh the feed with posts from official brand accounts
 * This will also filter out old posts
 */
export async function GET(request: Request) {
  try {
    console.log('Refresh API: Starting refresh...');
    
    // Check if force parameter is provided
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('force') === 'true';
    
    if (forceRefresh) {
      console.log('Refresh API: Force refresh requested - will ignore previously processed runs');
    }
    
    const result = await updatePostsFromApify({ force: forceRefresh });
    
    console.log('Refresh API: Update completed', result);
    
    if (result.success) {
      if (result.alreadyProcessed && !forceRefresh) {
        return NextResponse.json({ 
          success: true, 
          message: 'Already up to date. No new posts to process.',
          runId: result.runId,
          newPosts: 0
        });
      } else {
        return NextResponse.json({ 
          success: true, 
          message: `Posts refreshed successfully: ${result.message}`,
          runId: result.runId,
          newPosts: result.newPosts
        });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `Failed to refresh posts: ${result.message}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Refresh API: Error refreshing posts', error);
    return NextResponse.json({ 
      success: false, 
      message: `Error refreshing posts: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
} 