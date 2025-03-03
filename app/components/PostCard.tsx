import React, { useState } from 'react';
import { IPost } from '@/src/mocks/mockPostData';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: IPost;
}

interface MediaContainerProps {
  aspectRatio?: number;
  children: React.ReactNode;
}

const MediaContainer = ({ aspectRatio = 1.25, children }: MediaContainerProps) => {
  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
};

const PostMedia = ({ post }: { post: IPost }) => {
  const [mediaError, setMediaError] = useState(false);

  // If no media URL is provided, show a placeholder
  if (!post.mediaUrl) {
    return (
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No media available</span>
      </div>
    );
  }

  // Handle video content
  if (post.mediaType === 'VIDEO') {
    return (
      <MediaContainer aspectRatio={post.aspectRatio || 1.25}>
        {mediaError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <a 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View video on Instagram →
            </a>
          </div>
        ) : (
          <video
            controls
            playsInline
            poster={post.thumbnailUrl}
            className="w-full h-full object-contain"
            onError={() => setMediaError(true)}
          >
            <source src={post.mediaUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        )}
      </MediaContainer>
    );
  }

  // Handle image content
  return (
    <MediaContainer aspectRatio={post.aspectRatio || 1.25}>
      {mediaError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View image on Instagram →
          </a>
        </div>
      ) : (
        <Image
          src={post.mediaUrl}
          alt={post.caption || 'Post image'}
          fill={true}
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setMediaError(true)}
        />
      )}
    </MediaContainer>
  );
};

export const PostCard = ({ post }: PostCardProps) => {
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
      
      {/* Post Media */}
      <PostMedia post={post} />
      
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