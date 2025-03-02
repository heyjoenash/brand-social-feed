'use client';

import React, { useState, useEffect } from 'react';
import { IPost } from '../src/mocks/mockPostData';
import { PostCard } from './components/PostCard';
import { BrandFilter } from './components/BrandFilter';
import RefreshButton from './components/RefreshButton';

export default function Feed() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  
  // Get unique brands from posts
  const brands = Array.from(new Set(posts.map(post => post.brand))).sort();
  
  // Filter posts by selected brand
  const filteredPosts = selectedBrand
    ? posts.filter(post => post.brand === selectedBrand)
    : posts;
    
  // Sort posts by timestamp (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => b.timestamp - a.timestamp);
  
  // Initialize the app and load posts
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Call the init endpoint to start our cron job
        await fetch('/api/init');
        
        // Fetch posts
        const response = await fetch('/api/posts');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Failed to load posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
    
    // Set up polling to refresh posts every minute
    const intervalId = setInterval(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('/api/posts', { 
          signal: controller.signal,
          // Add cache busting to prevent stale responses
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (err) {
        // Don't show error UI for background refreshes
        // Just log to console unless it's an abort error
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error('Failed to refresh posts in background:', err);
        }
      }
    }, 60000); // 1 minute
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">Brand Social Feed</h1>
          <p className="text-gray-700 text-lg">
            Latest Instagram posts from your favorite brands
          </p>
        </header>
        
        {/* Add refresh button */}
        <div className="mb-6">
          <RefreshButton />
        </div>
        
        {/* Brand Filter */}
        {posts.length > 0 && (
          <BrandFilter
            brands={brands}
            selectedBrand={selectedBrand}
            onChange={setSelectedBrand}
          />
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 border border-red-300 shadow-sm">
            {error}
          </div>
        )}
        
        {/* Posts Grid */}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {/* Empty State */}
            {sortedPosts.length === 0 && (
              <div className="text-center p-8 bg-white rounded-lg shadow border border-gray-300">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">No posts found</h3>
                <p className="text-gray-700">
                  {selectedBrand
                    ? `No posts available for ${selectedBrand}`
                    : 'No posts are available at the moment'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
