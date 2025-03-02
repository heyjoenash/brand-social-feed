import { NextResponse } from 'next/server';
import { fetchLatestTaskRun } from '../../../src/utils/apifyFetcher';

export async function GET() {
  try {
    console.log('Testing Apify task connection...');
    
    // Test the connection to Apify
    const taskRun = await fetchLatestTaskRun();
    
    if (!taskRun) {
      return NextResponse.json({
        success: false,
        message: 'Could not connect to Apify task. Check your APIFY_API_TOKEN and APIFY_TASK_ID.'
      }, { status: 500 });
    }
    
    // Return task details
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Apify task',
      task: {
        id: taskRun.id,
        actorId: taskRun.actorId,
        actorRunId: taskRun.actorRunId,
        status: taskRun.status,
        startedAt: taskRun.startedAt,
        finishedAt: taskRun.finishedAt,
        datasetId: taskRun.defaultDatasetId,
        buildId: taskRun.buildId
      }
    });
  } catch (error) {
    console.error('Error testing Apify connection:', error);
    return NextResponse.json({
      success: false,
      message: 'Error connecting to Apify task',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 