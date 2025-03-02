import cron from 'node-cron';
import { updatePostsFromApify } from './apifyFetcher';
import { addPosts } from './postUtils';

// Initialize with real data only
export const initializeWithMockData = () => {
  // Function kept for compatibility, but doesn't add mock data anymore
  console.log('Initializing without mock data...');
  // No mock data is added
  console.log('Using only real data');
};

// Schedule a job to run every hour
export const setupCronJob = () => {
  // Run immediately on startup
  updatePostsFromApify().catch(err => {
    console.error('Failed to update posts on startup:', err);
  });
  
  // Then schedule to run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await updatePostsFromApify();
    } catch (error) {
      console.error('Cron job failed:', error);
    }
  });
  
  console.log('Cron job scheduled to run every hour');
};