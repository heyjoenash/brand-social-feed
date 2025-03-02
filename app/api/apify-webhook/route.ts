import { NextRequest, NextResponse } from 'next/server';
import { addPosts, transformApifyData } from '../../../src/utils/postUtils';

// This is a simple secret key to validate webhook requests
// In production, use a more secure approach
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Apify (using a simple secret)
    const secretHeader = request.headers.get('x-webhook-secret');
    
    if (secretHeader !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse the JSON body
    const data = await request.json();
    
    // Check if we have the expected data structure
    if (!data || !Array.isArray(data.data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    // Transform and add the posts
    const posts = transformApifyData(data.data);
    addPosts(posts);
    
    return NextResponse.json({ 
      success: true,
      message: `Processed ${posts.length} posts`
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook data' },
      { status: 500 }
    );
  }
} 