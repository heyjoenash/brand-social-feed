import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { transformApifyData } from './postUtils';

// Apify configuration
const API_TOKEN = process.env.APIFY_API_TOKEN;
const DATASET_ID = process.env.APIFY_DATASET_ID;
const TASK_ID = process.env.APIFY_TASK_ID;

// File to store the last processed run information - make Vercel compatible
const LAST_RUN_FILE = path.join(
  process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd(), 
  'public/data/last_run.json'
);

/**
 * Save information about the last processed run
 */
const saveLastRunInfo = (runId: string, itemCount: number) => {
  if (!fs.existsSync(path.dirname(LAST_RUN_FILE))) {
    fs.mkdirSync(path.dirname(LAST_RUN_FILE), { recursive: true });
  }
  
  fs.writeFileSync(LAST_RUN_FILE, JSON.stringify({
    runId,
    processedAt: new Date().toISOString(),
    itemCount
  }));
  
  console.log(`Saved last run info: ${runId} with ${itemCount} items`);
};

/**
 * Get information about the last processed run
 */
const getLastRunInfo = () => {
  if (fs.existsSync(LAST_RUN_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LAST_RUN_FILE, 'utf8'));
    } catch (error) {
      console.error('Error reading last run file:', error);
    }
  }
  return null;
};

/**
 * Fetch the latest task run information
 */
export const fetchLatestTaskRun = async () => {
  if (!API_TOKEN || !TASK_ID) {
    console.warn('Missing Apify API token or Task ID');
    return null;
  }

  try {
    // First try to get the last run specifically
    const response = await axios.get(
      `https://api.apify.com/v2/actor-tasks/${TASK_ID}/runs/last`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }
    );

    if (response.data && response.data.data && response.data.data.status === 'SUCCEEDED') {
      console.log(`Latest task run found: ${response.data.data.id} (finished at ${response.data.data.finishedAt})`);
      return response.data.data;
    } 
    
    // If last run isn't SUCCEEDED, try listing all recent runs to find the most recent successful one
    if (response.data && response.data.data && response.data.data.status !== 'SUCCEEDED') {
      console.log(`Latest task run is not successful. Status: ${response.data.data.status}. Checking for recent successful runs...`);
      
      const runsResponse = await axios.get(
        `https://api.apify.com/v2/actor-tasks/${TASK_ID}/runs`,
        {
          params: {
            limit: 10,  // Check last 10 runs
            desc: true  // Sort by most recent first
          },
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`
          }
        }
      );
      
      if (runsResponse.data && runsResponse.data.data && runsResponse.data.data.items) {
        // Find most recent SUCCEEDED run
        const successfulRun = runsResponse.data.data.items.find((run: any) => run.status === 'SUCCEEDED');
        
        if (successfulRun) {
          console.log(`Found recent successful run: ${successfulRun.id} (finished at ${successfulRun.finishedAt})`);
          return successfulRun;
        }
      }
    }
    
    console.warn('No successful task runs found');
    return null;
  } catch (error) {
    console.error('Error fetching latest task run:', error);
    return null;
  }
};

/**
 * Fetch dataset items from the specified dataset
 */
export const fetchDatasetItems = async (datasetId: string) => {
  if (!API_TOKEN || !datasetId) {
    console.warn('Missing Apify API token or Dataset ID');
    return [];
  }

  try {
    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items`;
    console.log(`Fetching dataset from: ${datasetUrl}`);
    
    const response = await axios.get(datasetUrl, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn('No items found in dataset');
      return [];
    }

    console.log(`Fetched ${response.data.length} items from dataset`);
    
    // Detect accounts that were scraped
    const accounts = new Set<string>();
    
    response.data.forEach((item: any) => {
      // Try to extract username from different possible fields
      const username = 
        (item.username) || 
        (item.ownerUsername) || 
        (item.owner?.username) ||
        (item.userData?.username) ||
        (item.user?.username);
        
      if (username) {
        accounts.add(username.toLowerCase());
      }
    });
    
    console.log('Detected Instagram accounts in dataset:', Array.from(accounts).join(', '));
    
    // If we have the first item, log its structure for debugging
    if (response.data[0]) {
      console.log('First item structure:', Object.keys(response.data[0]));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching dataset items:', error);
    return [];
  }
};

/**
 * Update posts from Apify
 */
export const updatePostsFromApify = async (options?: { force?: boolean }) => {
  try {
    // 1. Get the latest task run
    const latestRun = await fetchLatestTaskRun();
    if (!latestRun) {
      console.warn('No successful task run found');
      return { success: false, message: 'No successful task run found' };
    }
    
    // 2. Check if we've already processed this run
    const lastRunInfo = getLastRunInfo();
    if (lastRunInfo && lastRunInfo.runId === latestRun.id && !options?.force) {
      console.log(`Run ${latestRun.id} has already been processed with ${lastRunInfo.itemCount} items`);
      return { 
        success: true, 
        message: 'Already up to date',
        runId: latestRun.id,
        newPosts: 0,
        alreadyProcessed: true
      };
    }

    // Log whether this is a forced refresh
    if (options?.force) {
      console.log(`Forcing refresh of run ${latestRun.id} even though it was already processed`);
    }

    // 3. Get the dataset ID from the run
    const datasetId = latestRun.defaultDatasetId || DATASET_ID;
    if (!datasetId) {
      console.warn('No dataset ID found');
      return { success: false, message: 'No dataset ID found' };
    }

    // 4. Fetch items from the dataset
    const items = await fetchDatasetItems(datasetId);
    if (items.length === 0) {
      console.warn('No items found in dataset');
      return { success: false, message: 'No items found in dataset' };
    }

    // 5. Transform data and save posts
    const transformedPosts = await transformApifyData(items);
    if (transformedPosts.length === 0) {
      console.warn('No valid posts found after transformation');
      return { success: false, message: 'No valid posts found after transformation' };
    }

    // 6. Save last run info
    saveLastRunInfo(latestRun.id, items.length);

    return { 
      success: true, 
      message: `Fetched ${items.length} items, transformed ${transformedPosts.length} posts`,
      runId: latestRun.id,
      newPosts: transformedPosts.length
    };
  } catch (error) {
    console.error('Error updating posts from Apify:', error);
    return { success: false, message: String(error) };
  }
};