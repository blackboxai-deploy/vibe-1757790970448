'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GeneratedVideo } from '@/types/video';
import { getVideoHistoryFromStorage, clearVideoHistory, downloadVideo } from '@/lib/video-utils';

interface GenerationHistoryProps {
  onVideoSelect?: (video: GeneratedVideo) => void;
  className?: string;
}

const GenerationHistory: React.FC<GenerationHistoryProps> = ({ 
  onVideoSelect, 
  className 
}) => {
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = () => {
      const savedHistory = getVideoHistoryFromStorage();
      setHistory(savedHistory);
    };

    loadHistory();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClearHistory = () => {
    clearVideoHistory();
    setHistory([]);
    setSelectedVideoId(null);
  };

  const handleVideoSelect = (video: GeneratedVideo) => {
    setSelectedVideoId(video.id);
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const handleDownloadVideo = async (video: GeneratedVideo, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await downloadVideo(video.videoUrl, `${video.prompt.slice(0, 30)}.mp4`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const truncatePrompt = (prompt: string, maxLength: number = 60) => {
    return prompt.length > maxLength ? `${prompt.slice(0, maxLength)}...` : prompt;
  };

  if (history.length === 0) {
    return (
      <Card className={`border-slate-200 dark:border-slate-700 ${className || ''}`}>
        <CardHeader>
          <CardTitle className="text-lg">Generation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              No videos yet
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generated videos will appear here for quick access
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-slate-200 dark:border-slate-700 ${className || ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Generation History</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Clear All
          </Button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {history.length} video{history.length !== 1 ? 's' : ''} generated
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-2 p-4">
            {history.map((video) => (
              <Card 
                key={video.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedVideoId === video.id 
                    ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-800' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                onClick={() => handleVideoSelect(video)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Video Thumbnail/Placeholder */}
                    <div className="w-full h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Video Details */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">
                        {truncatePrompt(video.prompt)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(video.createdAt)}
                        </span>
                        {video.duration && (
                          <Badge variant="secondary" className="text-xs">
                            {video.duration}s
                          </Badge>
                        )}
                      </div>

                      {video.style && video.style !== 'default' && (
                        <Badge variant="outline" className="text-xs">
                          {video.style}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => handleVideoSelect(video)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={(e) => handleDownloadVideo(video, e)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GenerationHistory;