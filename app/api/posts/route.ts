import { NextResponse } from 'next/server';
import { getPosts } from '../../../src/utils/postUtils';

export async function GET() {
  try {
    const posts = getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 