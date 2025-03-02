import { NextRequest, NextResponse } from 'next/server';
import { startActorRun } from '../../../src/utils/apifyFetcher';

export async function POST(request: NextRequest) {
  try {
    // Get the actor ID from the request body
    const body = await request.json();
    const { actorId, input = {} } = body;
    
    if (!actorId) {
      return NextResponse.json(
        { error: 'Actor ID is required' },
        { status: 400 }
      );
    }
    
    // Start the actor run
    const runId = await startActorRun(actorId, input);
    
    return NextResponse.json({
      success: true,
      message: 'Actor run started',
      runId,
      actorId
    });
  } catch (error) {
    console.error('Error starting actor run:', error);
    return NextResponse.json(
      { error: 'Failed to start actor run' },
      { status: 500 }
    );
  }
} 