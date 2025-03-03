export interface IPost {
  id: string;
  brand: string;
  caption: string;
  timestamp: number;
  url?: string;
  source: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl?: string;
  aspectRatio?: number;
}

export const MOCK_POSTS: IPost[] = [
  {
    id: "google-1",
    brand: "Google",
    source: "instagram",
    mediaType: 'IMAGE',
    mediaUrl: "https://picsum.photos/600/600?random=1",
    caption: "Introducing our latest innovation! #Google #Technology",
    timestamp: Date.now() - 3600000, // 1 hour ago
    url: "https://instagram.com/p/123abc",
    aspectRatio: 1
  },
  {
    id: "microsoft-1",
    brand: "Microsoft",
    source: "instagram",
    mediaType: 'IMAGE',
    mediaUrl: "https://picsum.photos/600/600?random=2",
    caption: "The future of productivity is here. Learn how our tools are helping people work smarter. #Microsoft #Productivity",
    timestamp: Date.now() - 7200000, // 2 hours ago
    url: "https://instagram.com/p/456def",
    aspectRatio: 1
  },
  {
    id: "apple-1",
    brand: "Apple",
    source: "instagram",
    mediaType: 'IMAGE',
    mediaUrl: "https://picsum.photos/600/600?random=3",
    caption: "Creativity unleashed. See what's possible with our new devices. #Apple #Innovation",
    timestamp: Date.now() - 10800000, // 3 hours ago
    url: "https://instagram.com/p/789ghi",
    aspectRatio: 1
  },
  {
    id: "amazon-1",
    brand: "Amazon",
    source: "instagram",
    mediaType: 'IMAGE',
    mediaUrl: "https://picsum.photos/600/600?random=4",
    caption: "Discover the best deals of the season! Shop now before they're gone. #Amazon #Shopping",
    timestamp: Date.now() - 14400000, // 4 hours ago
    url: "https://instagram.com/p/101jkl",
    aspectRatio: 1
  },
  {
    id: "nike-1",
    brand: "Nike",
    source: "instagram",
    mediaType: 'IMAGE',
    mediaUrl: "https://picsum.photos/600/600?random=5",
    caption: "Just do it. New collection dropping this weekend. #Nike #Sports",
    timestamp: Date.now() - 18000000, // 5 hours ago
    url: "https://instagram.com/p/112mno",
    aspectRatio: 1
  }
]; 