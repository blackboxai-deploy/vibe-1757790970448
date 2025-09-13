'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { downloadVideo, formatDuration } from '@/lib/video-utils';
import { toast } from 'sonner';

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoUrl: string;
  title?: string;
  className?: string;
}

const VideoControls: React.FC<VideoControlsProps> = ({ 
  videoRef, 
  videoUrl, 
  title,
  className 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [videoRef]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error('Fullscreen not supported in this browser');
    }
  };

  const handleDownload = async () => {
    try {
      toast.promise(
        downloadVideo(videoUrl, title ? `${title}.mp4` : undefined),
        {
          loading: 'Preparing download...',
          success: 'Video downloaded successfully!',
          error: 'Failed to download video'
        }
      );
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg ${className || ''}`}>
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading video...</span>
      </div>
    );
  }

  return (
    <div className={`bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-4 ${className || ''}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>{formatDuration(Math.floor(currentTime))}</span>
          <span>{formatDuration(Math.floor(duration))}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="h-10 w-10 p-0"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </Button>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleVolumeChange(volume > 0 ? [0] : [100])}
            >
              {volume > 0 ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.967 13.5a1 1 0 01-.637-.77L4 12.5V7.5a1 1 0 01.353-.768L7.97 3.5a1 1 0 011.414.076zm2.525 2.039A3.985 3.985 0 0114 9a3.985 3.985 0 01-2.092 3.885 1 1 0 11-.817-1.821A1.995 1.995 0 0012 9a1.995 1.995 0 00-.909-1.678 1 1 0 01.817-1.207z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.967 13.5H2a1 1 0 01-1-1V7a1 1 0 011-1h2.967l3.416-3.317a1 1 0 011.617.393zM17.707 9.293a1 1 0 010 1.414L15.414 13l2.293 2.293a1 1 0 11-1.414 1.414L14 14.414l-2.293 2.293a1 1 0 01-1.414-1.414L12.586 13l-2.293-2.293a1 1 0 111.414-1.414L14 11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </Button>
            <div className="w-20">
              <Slider
                value={[volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 000 2h1.586L2.293 8.293a1 1 0 101.414 1.414L6 7.414V9a1 1 0 002 0V5a1 1 0 00-1-1H3zm9 1a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-2 0V7.414l-2.293 2.293a1 1 0 11-1.414-1.414L14.586 6H13a1 1 0 01-1-1zM3 12a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 14.414V16a1 1 0 01-2 0v-4zm13 1a1 1 0 00-1 1v1.586l-2.293-2.293a1 1 0 00-1.414 1.414L13.586 16H12a1 1 0 000 2h4a1 1 0 001-1v-4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </Button>

          {/* Download Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;