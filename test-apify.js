const axios = require('axios');
const fs = require('fs');
const path = require('path');

// TOKEN from Apify console
const APIFY_API_TOKEN = 'apify_api_rzAV84UpxPfizq3fgcNUNSdUcc7eU22pRUiz';

// Apify dataset ID for Instagram data
const DATASET_ID = 'pAlTA4juhMHeLYswx';

// Define path for data file
const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/posts.json');

// Target brands we want to identify and display
const targetBrands = ['Adidas', 'Nike', 'Lululemon', 'Google', 'Google Developers'];

// Map of brand-related keywords, usernames, and hashtags to official brand names
const brandMapping = {
  // Official accounts - exact matches
  'adidas': 'Adidas',
  'nike': 'Nike',
  'lululemon': 'Lululemon',
  'google': 'Google',
  'googlefordevs': 'Google Developers',
  
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
  'adidasparis': 'Adidas',
  'adidasberlin': 'Adidas',
  'yesadidas': 'Adidas',
  
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
  'madebygoogle': 'Google',
  'googlecloud': 'Google Developers',
  'googleai': 'Google',
};

// List of official brand accounts for exact matching
const officialAccounts = [
  'adidas',
  'nike',
  'lululemon',
  'google',
  'googlefordevs'
];

// Define a maximum age for posts (in milliseconds)
const MAX_POST_AGE_MS = 2 * 365 * 24 * 60 * 60 * 1000; // About 2 years

/**
 * Fetches the latest dataset items from Apify
 */
const fetchDatasetItems = async () => {
  try {
    console.log('Fetching dataset items from Apify dataset...');
    const datasetUrl = `https://api.apify.com/v2/datasets/${DATASET_ID}/items?token=${APIFY_API_TOKEN}`;
    console.log(`Dataset URL: ${datasetUrl}`);
    
    const response = await axios.get(datasetUrl);
    const items = response.data;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn('No items found in dataset');
      return null;
    }
    
    console.log(`Found ${items.length} items in dataset`);
    
    // Log the first item for debugging
    if (items.length > 0) {
      console.log('First item structure sample keys:', Object.keys(items[0]));
    }
    
    return items;
  } catch (error) {
    console.error('Error fetching from Apify dataset:', error);
    return null;
  }
};

/**
 * Transforms raw Apify data into our post format
 */
const transformApifyData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('No data returned from Apify or invalid format');
    return [];
  }

  const currentTime = Date.now();

  const transformedPosts = data
    .map(item => {
      try {
        // First check if we have a valid post
        if (!item) {
          console.warn('Empty item received from Apify');
          return null;
        }
        
        // The Instagram format from Apify now returns user profile info and video content
        // We need to extract posts from this structure

        // First check if we're dealing with user details
        // In the Apify dataset we examined, a full profile looks like:
        if (item.latestIgtvVideos && Array.isArray(item.latestIgtvVideos)) {
          // This appears to be user profile data with posts inside
          console.log(`Found user profile with ${item.latestIgtvVideos.length} posts`);
          
          // Get username for brand detection
          const username = item.username || '';
          
          // We'll transform each post in the latestIgtvVideos array
          const profilePosts = [];
          
          for (const post of item.latestIgtvVideos) {
            // Skip if no post data
            if (!post) continue;
            
            // Extract post id
            const postId = post.id || post.shortCode || '';
            if (!postId) {
              console.warn('No post ID found, skipping post');
              continue;
            }
            
            // Extract caption
            const caption = post.caption || '';
            
            // Detect brand - start with the username
            let detectedBrand = '';
            if (officialAccounts.includes(username.toLowerCase())) {
              detectedBrand = brandMapping[username.toLowerCase()] || '';
              console.log(`Post from official account: ${username}, setting brand to ${detectedBrand}`);
            }
            
            // If no brand detected from username, check caption
            if (!detectedBrand && caption) {
              const captionLower = caption.toLowerCase();
              
              // Check hashtags
              const hashtags = post.hashtags || [];
              for (const hashtag of hashtags) {
                const tag = hashtag.toLowerCase().trim();
                if (tag in brandMapping) {
                  detectedBrand = brandMapping[tag];
                  console.log(`Found brand hashtag: #${hashtag}, setting brand to ${detectedBrand}`);
                  break;
                }
              }
              
              // If no brand found in hashtags, check caption text
              if (!detectedBrand) {
                for (const [keyword, brand] of Object.entries(brandMapping)) {
                  if (captionLower.includes(keyword.toLowerCase()) || 
                      captionLower.includes(brand.toLowerCase())) {
                    detectedBrand = brand;
                    console.log(`Found brand mention in caption: ${keyword}, setting brand to ${detectedBrand}`);
                    break;
                  }
                }
              }
            }
            
            // If still no brand, try username as a fallback
            if (!detectedBrand && username) {
              for (const [keyword, brand] of Object.entries(brandMapping)) {
                if (username.toLowerCase().includes(keyword.toLowerCase())) {
                  detectedBrand = brand;
                  console.log(`Username ${username} contains brand keyword ${keyword}, setting brand to ${detectedBrand}`);
                  break;
                }
              }
            }
            
            // Skip if no brand detected or not in target list
            if (!detectedBrand || !targetBrands.includes(detectedBrand)) {
              console.log(`Skipping post - no target brand detected. Username: ${username}`);
              continue;
            }
            
            // Get timestamp
            let timestamp = currentTime;
            if (post.timestamp) {
              timestamp = typeof post.timestamp === 'string' 
                ? new Date(post.timestamp).getTime() 
                : post.timestamp;
            }
            
            // Skip if too old
            if (currentTime - timestamp > MAX_POST_AGE_MS) {
              console.log(`Skipping post - too old (${Math.floor((currentTime - timestamp) / (24 * 60 * 60 * 1000))} days)`);
              continue;
            }
            
            // Get image URL
            const imageUrl = post.displayUrl || 
                            post.videoUrl || 
                            post.thumbnailUrl || 
                            (post.images && post.images.length > 0 ? post.images[0] : '');
            
            if (!imageUrl) {
              console.warn('No image URL found for post, skipping');
              continue;
            }
            
            // Create a unique ID
            const uniqueId = `${detectedBrand.toLowerCase().replace(/\s+/g, '-')}-${postId}`;
            
            // Create post object
            const transformedPost = {
              id: uniqueId,
              brand: detectedBrand,
              source: 'instagram',
              postId: postId,
              imageUrl,
              caption,
              timestamp,
              url: post.url || `https://www.instagram.com/p/${post.shortCode}/`
            };
            
            console.log(`Successfully transformed post from user ${username}: ${transformedPost.id}`);
            profilePosts.push(transformedPost);
          }
          
          // Return null here as we'll flatten the array later
          return profilePosts;
        } else {
          // This appears to be a regular post
          // Extract username for brand detection
          const username = item.ownerUsername || 
                          (item.owner && item.owner.username) || 
                          item.username ||
                          (item.user && item.user.username) || '';
          
          // Extract caption
          const caption = item.caption || 
                         item.text || 
                         (item.edge_media_to_caption && 
                          item.edge_media_to_caption.edges && 
                          item.edge_media_to_caption.edges[0] && 
                          item.edge_media_to_caption.edges[0].node && 
                          item.edge_media_to_caption.edges[0].node.text) || 
                         '';
          
          // Detect brand - start with username
          let detectedBrand = '';
          if (officialAccounts.includes(username.toLowerCase())) {
            detectedBrand = brandMapping[username.toLowerCase()] || '';
            console.log(`Post from official account: ${username}, setting brand to ${detectedBrand}`);
          }
          
          // If no brand from username, check caption
          if (!detectedBrand && caption) {
            const captionLower = caption.toLowerCase();
            
            // Check for hashtags
            const hashtags = caption.match(/#(\w+)/g) || [];
            for (const hashtag of hashtags) {
              const tag = hashtag.substring(1).toLowerCase().trim();
              if (tag in brandMapping) {
                detectedBrand = brandMapping[tag];
                console.log(`Found brand hashtag: ${hashtag}, setting brand to ${detectedBrand}`);
                break;
              }
            }
            
            // If no brand from hashtags, check caption text
            if (!detectedBrand) {
              for (const [keyword, brand] of Object.entries(brandMapping)) {
                if (captionLower.includes(keyword.toLowerCase()) || 
                    captionLower.includes(brand.toLowerCase())) {
                  detectedBrand = brand;
                  console.log(`Found brand mention in caption: ${keyword}, setting brand to ${detectedBrand}`);
                  break;
                }
              }
            }
            
            // Check for @ mentions
            if (!detectedBrand) {
              const mentions = caption.match(/@(\w+)/g) || [];
              for (const mention of mentions) {
                const mentionName = mention.substring(1).toLowerCase().trim();
                if (mentionName in brandMapping) {
                  detectedBrand = brandMapping[mentionName];
                  console.log(`Found brand @mention: ${mention}, setting brand to ${detectedBrand}`);
                  break;
                }
              }
            }
          }
          
          // If still no brand, try username as fallback
          if (!detectedBrand && username) {
            for (const [keyword, brand] of Object.entries(brandMapping)) {
              if (username.toLowerCase().includes(keyword.toLowerCase())) {
                detectedBrand = brand;
                console.log(`Username ${username} contains brand keyword ${keyword}, setting brand to ${detectedBrand}`);
                break;
              }
            }
          }
          
          // Skip if no brand detected or not in target list
          if (!detectedBrand || !targetBrands.includes(detectedBrand)) {
            console.log(`Skipping post - no target brand detected. Username: ${username}`);
            return null;
          }
          
          // Get timestamp
          let timestamp = currentTime;
          if (item.timestamp) {
            timestamp = typeof item.timestamp === 'string' 
              ? new Date(item.timestamp).getTime() 
              : item.timestamp;
          } else if (item.taken_at_timestamp) {
            timestamp = typeof item.taken_at_timestamp === 'number' 
              ? item.taken_at_timestamp * 1000 
              : new Date(item.taken_at_timestamp).getTime();
          }
          
          // Skip if too old
          if (currentTime - timestamp > MAX_POST_AGE_MS) {
            console.log(`Skipping post - too old (${Math.floor((currentTime - timestamp) / (24 * 60 * 60 * 1000))} days)`);
            return null;
          }
          
          // Get image URL
          let imageUrl = item.displayUrl || 
                         item.imageUrl || 
                         item.thumbnailUrl || 
                         (item.images && Array.isArray(item.images) && item.images.length > 0 
                          ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url || '') 
                          : '') ||
                         item.mediaUrl || '';
          
          // If no image URL found, try to extract from other fields
          if (!imageUrl && typeof item === 'object' && item !== null) {
            for (const key of Object.keys(item)) {
              const value = item[key];
              if (typeof value === 'string' && 
                  (key.endsWith('Url') || key.includes('image') || key.includes('photo')) &&
                  value.startsWith('http')) {
                imageUrl = value;
                break;
              }
            }
          }
          
          // Skip if no image URL
          if (!imageUrl) {
            console.warn('No image URL found for post, skipping');
            return null;
          }
          
          // Extract post ID
          const id = item.id || item.shortCode || item.code || String(Date.now());
          const uniqueId = `${detectedBrand.toLowerCase().replace(/\s+/g, '-')}-${id}`;
          
          // Extract URL to original post
          const url = item.url || 
                     item.postUrl || 
                     (item.shortCode ? `https://www.instagram.com/p/${item.shortCode}/` : '') ||
                     (item.code ? `https://www.instagram.com/p/${item.code}/` : '');
          
          // Return a valid post object
          const post = {
            id: uniqueId,
            brand: detectedBrand,
            source: 'instagram',
            postId: id,
            imageUrl,
            caption,
            timestamp,
            url
          };
          
          console.log('Successfully transformed post:', post.brand, post.id);
          return post;
        }
      } catch (error) {
        console.error('Error transforming post:', error);
        return null;
      }
    })
    .filter(post => post !== null);
    
  // Flatten any arrays of posts (from profile data)
  const flattenedPosts = [];
  for (const post of transformedPosts) {
    if (Array.isArray(post)) {
      flattenedPosts.push(...post);
    } else {
      flattenedPosts.push(post);
    }
  }
    
  console.log(`Transformed ${flattenedPosts.length} posts from ${data.length} items`);
  return flattenedPosts;
};

/**
 * Saves posts to the JSON file
 */
const savePosts = (posts) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Sort posts by timestamp (newest first) before saving
    const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
    
    // Only keep the most recent 100 posts
    const limitedPosts = sortedPosts.slice(0, 100);
    
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(limitedPosts, null, 2));
    console.log(`Saved ${limitedPosts.length} posts to ${DATA_FILE_PATH}`);
  } catch (error) {
    console.error('Error saving posts file:', error);
  }
};

// Main function to run the test
async function main() {
  try {
    console.log('Starting test script...');
    
    // Fetch data from Apify
    const items = await fetchDatasetItems();
    
    if (!items) {
      console.error('No items returned from dataset');
      return;
    }
    
    // Transform the data
    const transformedPosts = transformApifyData(items);
    
    if (transformedPosts.length === 0) {
      console.warn('No posts were transformed from the dataset items');
      return;
    }
    
    console.log(`Successfully transformed ${transformedPosts.length} posts`);
    
    // Save the posts
    savePosts(transformedPosts);
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

// Run the test
main(); 