'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GenerationProgress } from '@/types/video';

interface ProgressIndicatorProps {
  progress: GenerationProgress;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress, className }) => {
  const getStatusColor = (status: GenerationProgress['status']) => {
    switch (status) {
      case 'idle':
        return 'text-slate-500';
      case 'generating':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  const getStatusText = (status: GenerationProgress['status']) => {
    switch (status) {
      case 'idle':
        return 'Ready to generate';
      case 'generating':
        return 'Generating video...';
      case 'completed':
        return 'Video generated successfully!';
      case 'error':
        return 'Generation failed';
      default:
        return 'Unknown status';
    }
  };

  const getProgressValue = () => {
    if (progress.status === 'completed') return 100;
    if (progress.status === 'error') return 0;
    if (progress.status === 'idle') return 0;
    return progress.progress || 0;
  };

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return '';
    
    if (seconds < 60) {
      return `${Math.round(seconds)}s remaining`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s remaining`;
  };

  if (progress.status === 'idle') {
    return null;
  }

  return (
    <Card className={`border-slate-200 dark:border-slate-700 ${className || ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${getStatusColor(progress.status)}`}>
              {getStatusText(progress.status)}
            </h3>
            {progress.status === 'generating' && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Processing...
                </span>
              </div>
            )}
          </div>

          {progress.status === 'generating' && (
            <div className="space-y-2">
              <Progress 
                value={getProgressValue()} 
                className="h-2"
              />
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{Math.round(getProgressValue())}% complete</span>
                {progress.estimatedTimeRemaining && (
                  <span>{formatTimeRemaining(progress.estimatedTimeRemaining)}</span>
                )}
              </div>
            </div>
          )}

          {progress.message && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {progress.message}
            </p>
          )}

          {progress.status === 'generating' && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>AI is analyzing your prompt and creating the video...</p>
                  <p className="text-xs">This process typically takes 30 seconds to 5 minutes depending on complexity.</p>
                </div>
              </div>
            </div>
          )}

          {progress.status === 'completed' && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Your video is ready to view and download!
                </span>
              </div>
            </div>
          )}

          {progress.status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  Something went wrong. Please try again.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressIndicator;