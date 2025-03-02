import fs from 'fs';
import path from 'path';
import { IPost } from '../mocks/mockPostData';

// Make file paths Vercel-compatible by using /tmp in production
const DATA_FILE_PATH = path.join(
  process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd(), 
  'public/data/posts.json'
);

// Define a maximum age for posts (in milliseconds)
const MAX_POST_AGE_MS = 2 * 365 * 24 * 60 * 60 * 1000; // About 2 years

// List of official brand accounts for exact matching
const officialAccounts = [
  'adidas',
  'nike',
  'lululemon',
  'google',
  'googlefordevs',
  'googleartculture',
  'madebygoogle',
  'openai',
  'anthropic',
  'claudeai',
  'midjourney',
  'microsoftai',
  'microsoft_ai',
  'meta_ai'
];

/**
 * Checks if a post is a mock post
 */
const isMockPost = (post: IPost): boolean => {
  // Identify mock posts by ID pattern or image URL
  const mockPostPatterns = ['google-1', 'microsoft-1', 'apple-1', 'amazon-1', 'nike-1'];
  
  return (
    mockPostPatterns.includes(post.id) || 
    (post.imageUrl && post.imageUrl.includes('picsum.photos') ? true : false)
  );
};

/**
 * Reads all posts from the JSON file
 */
export const getPosts = (): IPost[] => {
  try {
    // Check if file exists
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return [];
    }
    
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const posts = JSON.parse(fileContent) as IPost[];
    
    // Filter out any mock posts
    return posts.filter(post => !isMockPost(post));
  } catch (error) {
    console.error('Error reading posts file:', error);
    return [];
  }
};

/**
 * Writes posts to the JSON file
 */
export const savePosts = (posts: IPost[]): void => {
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
    console.log(`Saved ${limitedPosts.length} posts to the JSON file`);
  } catch (error) {
    console.error('Error saving posts file:', error);
  }
};

/**
 * Adds new posts to the store, avoiding duplicates
 */
export const addPosts = (newPosts: IPost[]): void => {
  const existingPosts = getPosts();
  
  // Create a Set of existing post IDs for quick lookup
  const existingIds = new Set(existingPosts.map(post => post.id));
  
  // Filter out posts that already exist
  const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
  
  console.log(`Adding ${uniqueNewPosts.length} new unique posts to existing ${existingPosts.length} posts`);
  
  // Merge and save
  if (uniqueNewPosts.length > 0) {
    savePosts([...existingPosts, ...uniqueNewPosts]);
  } else {
    console.log('No new unique posts to add');
  }
};

// Map of brand-related keywords, usernames, and hashtags to official brand names
const brandMapping: Record<string, string> = {
  // Official accounts - exact matches
  'adidas': 'Adidas',
  'nike': 'Nike',
  'lululemon': 'Lululemon',
  'google': 'Google',
  'googlefordevs': 'Google Developers',
  'googleartculture': 'Google',
  'madebygoogle': 'Google',
  
  // AI Companies - Official accounts
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'claudeai': 'Claude AI',
  'midjourney': 'Midjourney',
  'microsoftai': 'Microsoft AI',
  'microsoft_ai': 'Microsoft AI',
  'meta_ai': 'Meta AI',
  'metaai': 'Meta AI',
  
  // AI Hashtags and Keywords
  'gpt4': 'OpenAI',
  'gpt4o': 'OpenAI',
  'chatgpt': 'OpenAI',
  'dall_e': 'OpenAI',
  'dalle': 'OpenAI',
  'dalle3': 'OpenAI',
  'anthropicai': 'Anthropic',
  'claudesonnet': 'Claude AI',
  'claude3': 'Claude AI',
  'midjourneyai': 'Midjourney',
  'microsoftcopilot': 'Microsoft AI',
  'copilot': 'Microsoft AI',
  'llamaai': 'Meta AI',
  'metaairesearch': 'Meta AI',
  
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
  'googlecloud': 'Google Developers',
  'googleai': 'Google',
  'googlearts': 'Google'
};

/**
 * Analyzes the dataset to identify Instagram usernames for brand mapping
 */
const analyzeInstagramUsernames = (data: any[]) => {
  if (!data || data.length === 0) return;
  
  const detectedUsernames = new Set<string>();
  const brandToUsernames: Record<string, string[]> = {};
  
  // Extract all usernames from the dataset
  data.forEach(item => {
    try {
      let username = '';
      
      // Try all possible username fields
      if (item.username) {
        username = item.username;
      } else if (item.ownerUsername) {
        username = item.ownerUsername;
      } else if (item.owner && item.owner.username) {
        username = item.owner.username;
      } else if (item.userData && item.userData.username) {
        username = item.userData.username;
      }
      
      if (username) {
        detectedUsernames.add(username.toLowerCase());
      }
    } catch (error) {
      // Skip items with errors
    }
  });
  
  // Log detected usernames for easier mapping
  console.log('Instagram usernames detected in the dataset:');
  console.log(Array.from(detectedUsernames).join(', '));
  
  // Group usernames by brand using our mapping
  Object.entries(brandMapping).forEach(([key, brand]) => {
    if (!brandToUsernames[brand]) {
      brandToUsernames[brand] = [];
    }
    if (detectedUsernames.has(key.toLowerCase())) {
      brandToUsernames[brand].push(key);
    }
  });
  
  // Log usernames grouped by brand
  console.log('Instagram usernames grouped by brand:');
  Object.entries(brandToUsernames).forEach(([brand, usernames]) => {
    if (usernames.length > 0) {
      console.log(`${brand}: ${usernames.join(', ')}`);
    }
  });
  
  // Check for usernames not mapped to any brand
  const mappedUsernames = new Set<string>();
  Object.keys(brandMapping).forEach(key => mappedUsernames.add(key.toLowerCase()));
  
  const unmappedUsernames = Array.from(detectedUsernames).filter(username => 
    !mappedUsernames.has(username.toLowerCase())
  );
  
  if (unmappedUsernames.length > 0) {
    console.log('Unmapped Instagram usernames (consider adding to brandMapping):');
    console.log(unmappedUsernames.join(', '));
  }
};

/**
 * Transforms raw Apify data into our post format
 */
export const transformApifyData = async (data: any[]): Promise<IPost[]> => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('No data to transform');
    return [];
  }
  
  console.log(`Transforming ${data.length} items from Apify`);
  
  // Analyze Instagram usernames in the dataset for better brand mapping
  analyzeInstagramUsernames(data);
  
  const posts: IPost[] = [];
  let skippedByBrand = 0;
  let skippedByAge = 0;
  let skippedByNoImage = 0;
  let processed = 0;
  
  // Update the target brands array to include AI companies
  const targetBrands = ['Adidas', 'Nike', 'Lululemon', 'Google', 'Google Developers', 'OpenAI', 'Anthropic', 'Claude AI', 'Microsoft AI', 'Meta AI', 'Midjourney'];
  
  // Statistics counters for debugging
  let statsTotal = data.length;
  let statsProfiles = 0;
  let statsRegularPosts = 0;
  let statsFilteredByBrand = 0;
  let statsFilteredByAge = 0;
  let statsFilteredByImageUrl = 0;
  let statsTransformed = 0;
  
  // Current time for age calculations
  const currentTime = Date.now();
  
  const transformedPosts = data
    .map(item => {
      try {
        // First check if we have a valid post
        if (!item) {
          console.warn('Empty item received from Apify');
          return null;
        }
        
        // Debug item type
        const itemType = item.type || item.productType || 'unknown';
        
        // The Instagram format from Apify now returns user profile info and video content
        // We need to extract posts from this structure

        // First check if we're dealing with user details
        // In the Apify dataset we examined, a full profile looks like:
        if (item.latestIgtvVideos && Array.isArray(item.latestIgtvVideos)) {
          // This appears to be user profile data with posts inside
          statsProfiles++;
          console.log(`Found user profile for ${item.username || 'unknown'} with ${item.latestIgtvVideos.length} posts`);
          
          // Get username for brand detection
          const username = item.username || '';
          
          // We'll transform each post in the latestIgtvVideos array
          const profilePosts: IPost[] = [];
          
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
              statsFilteredByBrand++;
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
              statsFilteredByAge++;
              console.log(`Skipping post - too old (${Math.floor((currentTime - timestamp) / (24 * 60 * 60 * 1000))} days)`);
              continue;
            }
            
            // Get image URL
            const imageUrl = post.displayUrl || 
                            post.videoUrl || 
                            post.thumbnailUrl || 
                            (post.images && post.images.length > 0 ? post.images[0] : '');
            
            if (!imageUrl) {
              statsFilteredByImageUrl++;
              console.warn('No image URL found for post, skipping');
              continue;
            }
            
            // Create a unique ID
            const uniqueId = `${detectedBrand.toLowerCase().replace(/\s+/g, '-')}-${postId}`;
            
            // Create post object
            const transformedPost: IPost = {
              id: uniqueId,
              brand: detectedBrand,
              source: 'instagram',
              postId: postId,
              imageUrl,
              caption,
              timestamp,
              url: post.url || `https://www.instagram.com/p/${post.shortCode}/`
            };
            
            statsTransformed++;
            console.log(`Successfully transformed post from user ${username}: ${transformedPost.id}`);
            profilePosts.push(transformedPost);
          }
          
          // Return the array of posts from this profile
          return profilePosts;
        } else {
          // This appears to be a regular post
          statsRegularPosts++;
          
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
            statsFilteredByBrand++;
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
            statsFilteredByAge++;
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
                  (key.endsWith('Url') || key.includes('image') || key.includes('photo') || key.includes('display')) &&
                  value.startsWith('http')) {
                imageUrl = value;
                break;
              }
            }
          }
          
          // Skip if no image URL
          if (!imageUrl) {
            statsFilteredByImageUrl++;
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
          
          // Return a valid IPost object
          const post = {
            id: uniqueId,
            brand: detectedBrand,
            source: 'instagram',
            postId: id,
            imageUrl,
            caption,
            timestamp,
            url
          } as IPost;
          
          statsTransformed++;
          console.log('Successfully transformed post:', post.brand, post.id);
          return post;
        }
      } catch (error) {
        console.error('Error transforming post:', error);
        return null;
      }
    })
    .filter((post): post is IPost | IPost[] => post !== null);
    
  // Flatten any arrays of posts (from profile data)
  const flattenedPosts: IPost[] = [];
  for (const post of transformedPosts) {
    if (Array.isArray(post)) {
      flattenedPosts.push(...post);
    } else {
      flattenedPosts.push(post);
    }
  }
    
  // Log statistics
  console.log(`
Transformation Statistics:
-------------------------
Total items processed: ${statsTotal}
User profiles found: ${statsProfiles}
Regular posts found: ${statsRegularPosts}
Filtered out by brand: ${statsFilteredByBrand}
Filtered out by age: ${statsFilteredByAge}
Filtered out by missing image: ${statsFilteredByImageUrl}
Successfully transformed: ${statsTransformed}
Final posts count: ${flattenedPosts.length}
  `);
  
  // Add new posts after processing
  console.log(`Transformation complete. Processed: ${processed}, Skipped: Brand=${skippedByBrand}, Age=${skippedByAge}, NoImage=${skippedByNoImage}`);
  if (flattenedPosts.length > 0) {
    console.log(`Adding ${flattenedPosts.length} new posts to the store`);
    addPosts(flattenedPosts);
  }
  
  // Analyze which companies were found
  const companyStats: Record<string, number> = {};
  
  flattenedPosts.forEach(post => {
    if (!companyStats[post.brand]) {
      companyStats[post.brand] = 0;
    }
    companyStats[post.brand]++;
  });
  
  console.log('Company statistics from this update:');
  Object.entries(companyStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([company, count]) => {
      console.log(`- ${company}: ${count} posts`);
    });
  
  return flattenedPosts;
};