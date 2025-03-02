'use client';

import { useState } from 'react';

export default function RefreshButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    setStatus({ type: null, message: '' });
    setConnectionDetails(null);

    try {
      const url = forceRefresh ? '/api/refresh?force=true' : '/api/refresh';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStatus({ 
          type: 'success', 
          message: `✅ ${data.message}${data.newPosts ? ` (${data.newPosts} new posts)` : ''}` 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: `❌ ${data.message || 'Failed to refresh posts'}` 
        });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: '❌ Error connecting to refresh API' 
      });
      console.error('Error refreshing posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testApifyConnection = async () => {
    setIsTestingConnection(true);
    setStatus({ type: null, message: '' });
    setConnectionDetails(null);

    try {
      const response = await fetch('/api/apify-test');
      const data = await response.json();

      if (data.success) {
        setStatus({ 
          type: 'success', 
          message: `✅ ${data.message}` 
        });
        setConnectionDetails(data.task);
      } else {
        setStatus({ 
          type: 'error', 
          message: `❌ ${data.message || 'Failed to connect to Apify'}` 
        });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: '❌ Error testing Apify connection' 
      });
      console.error('Error testing Apify connection:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-4">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Posts from Apify'}
          </button>
          
          <button 
            onClick={testApifyConnection}
            disabled={isTestingConnection}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isTestingConnection ? 'Testing...' : 'Test Apify Connection'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="forceRefresh" 
            checked={forceRefresh} 
            onChange={(e) => setForceRefresh(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="forceRefresh" className="text-sm text-gray-700">
            Force refresh (ignore cached data)
          </label>
        </div>
      </div>
      
      {status.message && (
        <div 
          className={`mt-2 p-2 text-sm ${
            status.type === 'success' ? 'text-green-600' : 
            status.type === 'error' ? 'text-red-600' : ''
          }`}
        >
          {status.message}
        </div>
      )}
      
      {connectionDetails && (
        <div className="mt-2 p-3 border border-gray-200 rounded bg-gray-50 text-xs">
          <h3 className="font-bold text-sm mb-1">Apify Task Details:</h3>
          <pre>{JSON.stringify(connectionDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 