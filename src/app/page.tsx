import { targetBrands, brands } from '../config/brandConfig';

export default function Home() {
  console.log('=== DEBUG INFO ===');
  console.log('Available brands:', targetBrands);
  console.log('Brand config keys:', Object.keys(brands));
  console.log('=================');
  
  // ... rest of your component code ...
} 