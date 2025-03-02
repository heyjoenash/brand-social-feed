import { NextResponse } from 'next/server';
import { updatePostsFromApify } from '../../../src/utils/apifyFetcher';
import fs from 'fs';
import path from 'path';
import { IPost } from '../../../src/mocks/mockPostData';

/**
 * Manually trigger fetching posts from Apify
 * This allows us to bypass the initialization or cron schedule
 */
export async function GET() {
  try {
    console.log('Manual fetch from Apify triggered');
    await updatePostsFromApify();
    
    // After fetching, let's manually categorize posts based on captions
    console.log('Post-processing posts to categorize by brand mentions...');
    const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/posts.json');
    
    // Read the current posts
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const posts = JSON.parse(fileContent) as IPost[];
    
    // Brand keywords to look for
    const brandKeywords = {
      'adidas': 'Adidas',
      'nike': 'Nike',
      'lululemon': 'Lululemon',
      'google': 'Google'
    };
    
    // Process each post to check for brand mentions
    const updatedPosts = posts.map(post => {
      // Skip mock data (first 5 posts)
      if (post.id.includes('google-') || post.id.includes('microsoft-') || 
          post.id.includes('apple-') || post.id.includes('amazon-') || 
          post.id.includes('nike-')) {
        return post;
      }
      
      const caption = post.caption.toLowerCase();
      
      // Check for brand mentions in caption
      for (const [keyword, brandName] of Object.entries(brandKeywords)) {
        if (caption.includes(keyword) || caption.includes(`#${keyword}`) || caption.includes(`@${keyword}`)) {
          console.log(`Recategorizing post ${post.id} from ${post.brand} to ${brandName} based on caption`);
          return {
            ...post,
            brand: brandName,
            id: `${brandName.toLowerCase()}-${post.postId}`
          };
        }
      }
      
      return post;
    });
    
    // Save the updated posts
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updatedPosts, null, 2));
    console.log(`Updated ${updatedPosts.length} posts with brand categorization`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully fetched posts from Apify' 
    });
  } catch (error) {
    console.error('Error fetching from Apify:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch posts from Apify',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 