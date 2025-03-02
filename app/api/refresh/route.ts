import { NextResponse } from 'next/server';
import { updatePostsFromApify } from '../../../src/utils/apifyFetcher';
import fs from 'fs';
import path from 'path';
import { IPost } from '../../../src/mocks/mockPostData';

// Define path for data file - make Vercel compatible
const DATA_FILE_PATH = path.join(
  process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd(), 
  'public/data/posts.json'
);

// Define a maximum age for posts (in milliseconds)
const MAX_POST_AGE_MS = 3 * 30 * 24 * 60 * 60 * 1000; // About 3 months

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