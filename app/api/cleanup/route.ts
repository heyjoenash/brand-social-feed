import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { IPost } from '../../../src/mocks/mockPostData';

// File path for posts data
const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/posts.json');

/**
 * API endpoint to clean up mock data from the posts.json file
 */
export async function GET() {
  try {
    // Read the current posts file
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return NextResponse.json({ 
        success: false, 
        message: 'No posts file found to clean up' 
      });
    }
    
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const posts = JSON.parse(fileContent) as IPost[];
    
    console.log(`Found ${posts.length} posts before cleanup`);
    
    // Identify the mock posts - they have specific IDs and use picsum.photos for images
    const mockPostPatterns = [
      'google-1',
      'microsoft-1',
      'apple-1',
      'amazon-1',
      'nike-1'
    ];
    
    // Filter out the mock posts
    const cleanedPosts = posts.filter(post => {
      // Check if this is a mock post by ID or image URL
      const isMockPost = 
        mockPostPatterns.some(pattern => post.id === pattern) ||
        (post.imageUrl && post.imageUrl.includes('picsum.photos'));
      
      if (isMockPost) {
        console.log(`Removing mock post: ${post.id} - ${post.brand}`);
      }
      
      // Keep the post only if it's NOT a mock post
      return !isMockPost;
    });
    
    console.log(`Removed ${posts.length - cleanedPosts.length} mock posts`);
    
    // Save the cleaned posts back to the file
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(cleanedPosts, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up mock data. Removed ${posts.length - cleanedPosts.length} mock posts.`,
      postsRemaining: cleanedPosts.length
    });
    
  } catch (error) {
    console.error('Error cleaning up mock data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clean up mock data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 