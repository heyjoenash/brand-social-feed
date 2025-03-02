import React, { useState } from 'react';
import { IPost } from '@/src/mocks/mockPostData';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: IPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  // State to track if Next.js Image fails
  const [imageError, setImageError] = useState(false);
  
  // Format timestamp to a readable format
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });
  
  // Truncate caption if too long
  const truncatedCaption = post.caption.length > 120 
    ? `${post.caption.substring(0, 120)}...` 
    : post.caption;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <div className="p-4 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div className="font-bold text-gray-800 text-lg">{post.brand}</div>
          <div className="text-xs px-2 py-1 bg-gray-300 rounded-full font-medium text-gray-700 border border-gray-400">{post.source}</div>
        </div>
        <div className="text-sm text-gray-600 mt-1 font-medium">{timeAgo}</div>
      </div>
      
      {/* Post Image */}
      <div className="relative aspect-square w-full">
        {!imageError ? (
          <Image 
            src={post.imageUrl} 
            alt={`${post.brand} post`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback to regular img tag if Next.js Image fails
          <img
            src={post.imageUrl}
            alt={`${post.brand} post`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      
      {/* Post Caption */}
      <div className="p-4">
        <p className="text-sm text-gray-800 leading-relaxed">{truncatedCaption}</p>
        
        {/* View original link */}
        {post.url && (
          <div className="mt-4">
            <a 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Original Post →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}; 