/**
 * This script directly fetches data from the Apify dataset and processes it to understand 
 * what is happening with the data transformation.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// TOKEN from Apify console
const APIFY_API_TOKEN = 'apify_api_rzAV84UpxPfizq3fgcNUNSdUcc7eU22pRUiz';

// Apify dataset ID for Instagram data
const DATASET_ID = 'pAlTA4juhMHeLYswx';

// Target Instagram accounts to include
const TARGET_ACCOUNTS = ['adidas', 'nike', 'lululemon', 'google', 'googlefordevs', 'googleartculture', 'madebygoogle'];

// Output file path
const OUTPUT_FILE = path.join(process.cwd(), 'public/data/test-posts.json');

// Target brands we want to identify and display
const targetBrands = ['Adidas', 'Nike', 'Lululemon', 'Google', 'Google Developers'];

// Statistics
let totalItems = 0;
let brandFilteredItems = 0;
let ageFilteredItems = 0;
let imageFilteredItems = 0;
let validPosts = 0;

// Define a maximum age for posts (in milliseconds)
const MAX_POST_AGE_MS = 2 * 365 * 24 * 60 * 60 * 1000; // About 2 years

// Map of brand-related keywords, usernames, and hashtags to official brand names
const brandMapping = {
  // Official accounts - exact matches
  'adidas': 'Adidas',
  'nike': 'Nike',
  'lululemon': 'Lululemon',
  'google': 'Google',
  'googlefordevs': 'Google Developers',
  'googleartculture': 'Google',
  'madebygoogle': 'Google',
  
  // Adidas variations for hashtags/mentions
  'adidasoriginals': 'Adidas',
  'adidassportswear': 'Adidas',
  'adidasrunning': 'Adidas',
  'adidasfootball': 'Adidas',
  'adidastraining': 'Adidas',
  'adidasbasketball': 'Adidas',
  'adidasterrex': 'Adidas',
  'adidastennis': 'Adidas',
  'adidaswomen': 'Adidas',
  'adidasmen': 'Adidas',
  'createdwithadidas': 'Adidas',
  'adidasvibes': 'Adidas',
  
  // Nike variations
  'nikesportswear': 'Nike',
  'nikerunning': 'Nike',
  'nikefootball': 'Nike',
  'nikebasketball': 'Nike',
  'nikesb': 'Nike',
  'niketraining': 'Nike',
  'nikewomen': 'Nike',
  'nikemen': 'Nike',
  'justdoit': 'Nike',
  
  // Lululemon variations
  'lululemonmen': 'Lululemon',
  'lululemonathletics': 'Lululemon',
  
  // Google variations
  'googlestore': 'Google',
  'googlepixel': 'Google',
  'googlecloud': 'Google Developers',
  'googleai': 'Google',
  'googlearts': 'Google'
};

/**
 * Fetches the latest dataset items from Apify
 */
async function fetchDatasetItems() {
  try {
    console.log('Fetching items from Apify dataset...');
    const datasetUrl = `https://api.apify.com/v2/datasets/${DATASET_ID}/items?token=${APIFY_API_TOKEN}`;
    console.log(`Dataset URL: ${datasetUrl}`);
    
    const response = await axios.get(datasetUrl);
    const items = response.data;
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('No items found in dataset');
      return [];
    }
    
    console.log(`Found ${items.length} items in dataset`);
    totalItems = items.length;
    
    // Log the first item for debugging
    if (items.length > 0) {
      console.log('Sample item keys:', Object.keys(items[0]));
      
      // Log a nicely formatted sample of the item
      console.log('Sample item value (partial):');
      const sampleItem = items[0];
      console.log(JSON.stringify({
        id: sampleItem.id,
        shortCode: sampleItem.shortCode,
        type: sampleItem.type,
        productType: sampleItem.productType,
        username: sampleItem.username || sampleItem.ownerUsername,
        timestamp: sampleItem.timestamp,
        caption: sampleItem.caption ? sampleItem.caption.substring(0, 100) + '...' : 'No caption'
      }, null, 2));
    }
    
    return items;
  } catch (error) {
    console.error('Error fetching from Apify:', error);
    return [];
  }
}

/**
 * Transform Apify data into our post format
 */
function transformApifyData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  const currentTime = Date.now();
  const transformed = [];
  
  // Create a post from item data
  function createPost(id, username, brand, caption, timestamp, imageUrl, url, shortCode) {
    const uniqueId = `${brand.toLowerCase().replace(/\s+/g, '-')}-${id}`;
    
    return {
      id: uniqueId,
      brand: brand,
      source: 'instagram',
      postId: id,
      imageUrl: imageUrl,
      caption: caption || '',
      timestamp: timestamp || currentTime,
      url: url || `https://www.instagram.com/p/${shortCode}/`
    };
  }
  
  // Process each item from the dataset
  for (const item of data) {
    try {
      // Extract basic info
      const id = item.id || item.shortCode || String(Date.now());
      const username = item.username || 
                     item.ownerUsername || 
                     (item.owner && item.owner.username) || '';
      const caption = item.caption || '';
      const shortCode = item.shortCode || '';
      
      // Use timestamp from item or default to current time
      let timestamp = currentTime;
      if (item.timestamp) {
        timestamp = typeof item.timestamp === 'string' 
          ? new Date(item.timestamp).getTime() 
          : item.timestamp;
      }
      
      // Skip if post is too old
      if (currentTime - timestamp > MAX_POST_AGE_MS) {
        ageFilteredItems++;
        continue;
      }
      
      // Extract image URL
      let imageUrl = '';
      
      // Try to find an image URL in the item
      const urlFields = ['displayUrl', 'thumbnailUrl', 'videoUrl', 'mediaUrl'];
      for (const field of urlFields) {
        if (item[field] && typeof item[field] === 'string' && item[field].startsWith('http')) {
          imageUrl = item[field];
          break;
        }
      }
      
      // Check in other fields that might contain URLs
      if (!imageUrl) {
        for (const key in item) {
          const value = item[key];
          if (typeof value === 'string' && 
              (key.includes('Url') || key.includes('url') || key.includes('image')) && 
              value.startsWith('http')) {
            imageUrl = value;
            break;
          }
        }
      }
      
      // Skip if no image URL
      if (!imageUrl) {
        imageFilteredItems++;
        continue;
      }
      
      // Detect brand
      let brand = null;
      
      // Check if username matches a known brand account
      if (username && TARGET_ACCOUNTS.includes(username.toLowerCase())) {
        brand = brandMapping[username.toLowerCase()];
      }
      
      // If no brand detected, check caption for brand mentions
      if (!brand && caption) {
        const captionLower = caption.toLowerCase();
        
        // Check for brand keywords in caption
        for (const [keyword, brandName] of Object.entries(brandMapping)) {
          if (captionLower.includes(keyword.toLowerCase())) {
            brand = brandName;
            break;
          }
        }
      }
      
      // Skip if no brand detected or not a target brand
      if (!brand || !targetBrands.includes(brand)) {
        brandFilteredItems++;
        continue;
      }
      
      // Create post and add to transformed list
      const post = createPost(id, username, brand, caption, timestamp, imageUrl, item.url, shortCode);
      transformed.push(post);
      validPosts++;
      
    } catch (error) {
      console.error('Error processing item:', error);
    }
  }
  
  return transformed;
}

/**
 * Saves posts to file
 */
function savePosts(posts) {
  try {
    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Sort posts by timestamp (newest first)
    const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedPosts, null, 2));
    console.log(`Saved ${sortedPosts.length} posts to ${OUTPUT_FILE}`);
    
    // Log the most recent post
    if (sortedPosts.length > 0) {
      const mostRecent = sortedPosts[0];
      console.log('Most recent post:');
      console.log(`- Brand: ${mostRecent.brand}`);
      console.log(`- Date: ${new Date(mostRecent.timestamp).toLocaleString()}`);
      console.log(`- Caption: ${mostRecent.caption.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.error('Error saving posts:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('Starting Apify dataset test...');
    
    // Fetch items from dataset
    const items = await fetchDatasetItems();
    
    if (items.length === 0) {
      console.log('No items to process.');
      return;
    }
    
    // Transform items into posts
    const posts = transformApifyData(items);
    
    // Save transformed posts
    savePosts(posts);
    
    // Log statistics
    console.log('\nProcessing Statistics:');
    console.log('---------------------');
    console.log(`Total items: ${totalItems}`);
    console.log(`Filtered by brand: ${brandFilteredItems}`);
    console.log(`Filtered by age: ${ageFilteredItems}`);
    console.log(`Filtered by missing image: ${imageFilteredItems}`);
    console.log(`Valid posts: ${validPosts}`);
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
main(); 