import { IPost } from '../mocks/mockPostData';

export interface SubBrand {
  displayName: string;
  account: string;
  hashtags: string[];
  keywords: string[];
}

export interface BrandConfig {
  displayName: string;
  category: string;
  subBrands: SubBrand[];
  keywords: string[];  // Keywords that apply to all sub-brands
}

export const brands: Record<string, BrandConfig> = {
  apple: {
    displayName: 'Apple',
    category: 'Tech',
    keywords: ['apple', 'iphone', 'ipad', 'macbook'],
    subBrands: [
      {
        displayName: 'Apple',
        account: 'apple',
        hashtags: ['apple', 'iphone', 'ipad', 'macbook', 'ios', 'macos'],
        keywords: ['apple']
      },
      {
        displayName: 'Apple Fitness',
        account: 'applefitnessplus',
        hashtags: ['applefitness', 'applefitnessplus', 'closeringrings'],
        keywords: ['apple fitness']
      },
      {
        displayName: 'Apple News',
        account: 'applenews',
        hashtags: ['applenews'],
        keywords: ['apple news']
      },
      {
        displayName: 'Apple Support',
        account: 'applesupport',
        hashtags: ['applesupport', 'applehelp'],
        keywords: ['apple support']
      }
    ]
  },
  google: {
    displayName: 'Google',
    category: 'Tech',
    keywords: ['google'],
    subBrands: [
      {
        displayName: 'Google',
        account: 'google',
        hashtags: ['google', 'googlesearch'],
        keywords: ['google']
      },
      {
        displayName: 'Google Pixel',
        account: 'madebygoogle',
        hashtags: ['teampixel', 'pixel8', 'pixel8pro', 'pixelfold'],
        keywords: ['google pixel', 'pixel']
      },
      {
        displayName: 'Google Developers',
        account: 'googlefordevs',
        hashtags: ['googledev', 'googlecloud'],
        keywords: ['google developers']
      }
    ]
  },
  microsoft: {
    displayName: 'Microsoft',
    category: 'Tech',
    keywords: ['microsoft', 'msft'],
    subBrands: [
      {
        displayName: 'Microsoft AI',
        account: 'microsoftai',
        hashtags: ['msai', 'microsoftai', 'azureai'],
        keywords: ['microsoft ai', 'azure ai']
      },
      {
        displayName: 'Microsoft 365',
        account: 'microsoft365',
        hashtags: ['microsoft365', 'office365'],
        keywords: ['microsoft 365', 'office 365']
      },
      {
        displayName: 'Windows',
        account: 'windows',
        hashtags: ['windows11', 'windowsinsider'],
        keywords: ['windows', 'windows 11']
      },
      {
        displayName: 'Xbox',
        account: 'xbox',
        hashtags: ['xbox', 'xboxgamepass'],
        keywords: ['xbox', 'gamepass']
      }
    ]
  },
  adidas: {
    displayName: 'Adidas',
    category: 'Fashion',
    keywords: ['adidas'],
    subBrands: [
      {
        displayName: 'Adidas',
        account: 'adidas',
        hashtags: ['adidas'],
        keywords: ['adidas']
      },
      {
        displayName: 'Adidas Originals',
        account: 'adidasoriginals',
        hashtags: ['adidasoriginals'],
        keywords: ['adidas originals']
      }
    ]
  },
  nike: {
    displayName: 'Nike',
    category: 'Fashion',
    keywords: ['nike'],
    subBrands: [
      {
        displayName: 'Nike',
        account: 'nike',
        hashtags: ['nike', 'justdoit'],
        keywords: ['nike']
      },
      {
        displayName: 'Nike Sportswear',
        account: 'nikesportswear',
        hashtags: ['nikesportswear'],
        keywords: ['nike sportswear']
      }
    ]
  },
  lululemon: {
    displayName: 'Lululemon',
    category: 'Fashion',
    keywords: ['lululemon'],
    subBrands: [
      {
        displayName: 'Lululemon',
        account: 'lululemon',
        hashtags: ['lululemon', 'thesweatlife'],
        keywords: ['lululemon']
      }
    ]
  },
  ai: {
    displayName: 'AI',
    category: 'AI',
    keywords: ['ai', 'artificial intelligence'],
    subBrands: [
      {
        displayName: 'OpenAI',
        account: 'openai',
        hashtags: ['openai', 'chatgpt'],
        keywords: ['openai', 'chatgpt']
      },
      {
        displayName: 'Anthropic',
        account: 'anthropic',
        hashtags: ['anthropic', 'claude'],
        keywords: ['anthropic', 'claude ai']
      },
      {
        displayName: 'Claude AI',
        account: 'claudeai',
        hashtags: ['claudeai', 'anthropicai'],
        keywords: ['claude ai', 'claude assistant']
      },
      {
        displayName: 'Midjourney',
        account: 'midjourney',
        hashtags: ['midjourney', 'midjourneyart'],
        keywords: ['midjourney', 'mj']
      },
      {
        displayName: 'Meta AI',
        account: 'meta_ai',
        hashtags: ['metaai', 'llama2'],
        keywords: ['meta ai', 'llama 2']
      }
    ]
  }
};

// Generate arrays of parent brands and all sub-brands
export const parentBrands = Object.values(brands).map(brand => brand.displayName);
export const allBrands = Object.values(brands).flatMap(brand => 
  [brand.displayName, ...brand.subBrands.map(sub => sub.displayName)]
);

// Get sub-brands for a parent brand
export const getSubBrands = (parentBrand: string): string[] => {
  const brand = Object.values(brands).find(b => b.displayName === parentBrand);
  return brand ? brand.subBrands.map(sub => sub.displayName) : [];
};

// Get parent brand for a sub-brand
export const getParentBrand = (subBrand: string): string | null => {
  const parent = Object.values(brands).find(brand => 
    brand.subBrands.some(sub => sub.displayName === subBrand)
  );
  return parent ? parent.displayName : null;
};

// Generate brand mapping for detection
export const generateBrandMapping = (): Record<string, string> => {
  const mapping: Record<string, string> = {};
  
  Object.values(brands).forEach(brand => {
    brand.subBrands.forEach(subBrand => {
      // Map account to sub-brand display name
      mapping[subBrand.account.toLowerCase()] = subBrand.displayName;
      
      // Map hashtags to sub-brand display name
      subBrand.hashtags.forEach(tag => {
        mapping[tag.toLowerCase()] = subBrand.displayName;
      });
      
      // Map keywords to sub-brand display name
      subBrand.keywords.forEach(keyword => {
        mapping[keyword.toLowerCase()] = subBrand.displayName;
      });
    });
  });
  
  return mapping;
};

// Generate official accounts list
export const officialAccounts = Object.values(brands)
  .flatMap(brand => brand.subBrands)
  .map(sub => sub.account.toLowerCase());

// Helper function to get all Instagram URLs for Apify
export const getInstagramUrls = (): string[] => {
  return Object.values(brands)
    .flatMap(brand => brand.subBrands)
    .map(sub => `https://www.instagram.com/${sub.account}/`);
};

// Helper to get brands by category
export const getBrandsByCategory = (): Record<string, string[]> => {
  const categories: Record<string, string[]> = {};
  
  Object.values(brands).forEach(brand => {
    if (!categories[brand.category]) {
      categories[brand.category] = [];
    }
    categories[brand.category].push(brand.displayName);
    brand.subBrands.forEach(sub => {
      categories[brand.category].push(sub.displayName);
    });
  });
  
  return categories;
};

// Debug logs (after targetBrands is declared)
console.log('Loaded brands:', Object.keys(brands));
console.log('Generated target brands:', allBrands);

// Helper to validate brand configuration
export const validateBrandConfig = (): string[] => {
  const errors: string[] = [];
  
  Object.entries(brands).forEach(([key, config]) => {
    if (!config.displayName) errors.push(`${key}: Missing displayName`);
    if (!config.category) errors.push(`${key}: Missing category`);
    if (!config.keywords?.length) errors.push(`${key}: No keywords specified`);
    if (!config.subBrands?.length) errors.push(`${key}: No sub-brands specified`);
    
    // Validate each sub-brand
    config.subBrands?.forEach((subBrand, index) => {
      if (!subBrand.displayName) errors.push(`${key}.subBrands[${index}]: Missing displayName`);
      if (!subBrand.account) errors.push(`${key}.subBrands[${index}]: Missing account`);
      if (!subBrand.hashtags?.length) errors.push(`${key}.subBrands[${index}]: No hashtags specified`);
      if (!subBrand.keywords?.length) errors.push(`${key}.subBrands[${index}]: No keywords specified`);
    });
  });
  
  return errors;
}; 