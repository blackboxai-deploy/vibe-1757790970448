'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VideoControls from './VideoControls';
import { VideoPlayerProps } from '@/types/video';

const VideoPreview: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title, 
  onError, 
  className 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError('Failed to load video');
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  if (hasError) {
    return (
      <Card className={`border-red-200 dark:border-red-800 ${className || ''}`}>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Video Load Error
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Unable to load the video. This might be due to network issues or an invalid video URL.
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(videoUrl, '_blank')}
                className="text-slate-600"
              >
                Open in New Tab
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden border-slate-200 dark:border-slate-700 ${className || ''}`}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Loading video...</p>
              </div>
            </div>
          )}

          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-auto max-h-96 bg-black"
            controls={false}
            onError={handleVideoError}
            onLoadedData={handleVideoLoad}
            onLoadStart={() => setIsLoading(true)}
            preload="metadata"
            playsInline
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>

          {/* Title Overlay */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-medium text-sm truncate">
                {title}
              </h3>
            </div>
          )}
        </div>

        {/* Custom Controls */}
        {!isLoading && !hasError && (
          <VideoControls
            videoRef={videoRef}
            videoUrl={videoUrl}
            title={title}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default VideoPreview;