'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import VideoPreview from './VideoPreview';
import ProgressIndicator from './ProgressIndicator';
import PromptSuggestions from './PromptSuggestions';
import GenerationHistory from './GenerationHistory';

import { VideoGenerationRequest, GenerationProgress, GeneratedVideo } from '@/types/video';
import { validateVideoPrompt, generateVideoId, saveVideoToHistory, ASPECT_RATIOS, VIDEO_STYLES, DURATION_OPTIONS } from '@/lib/video-utils';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<number>(5);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [style, setStyle] = useState<string>('default');
  const [progress, setProgress] = useState<GenerationProgress>({ status: 'idle' });
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(
    'Create a high-quality video based on the user prompt. Focus on smooth motion, cinematic quality, and visual appeal. Ensure proper lighting, composition, and detail.'
  );

  const handleGenerate = async () => {
    // Validate prompt
    const validation = validateVideoPrompt(prompt);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Start generation process
    setProgress({
      status: 'generating',
      progress: 0,
      message: 'Initializing video generation...',
      estimatedTimeRemaining: 180 // 3 minutes estimate
    });

    // Clear previous results
    setGeneratedVideo(null);

    let progressInterval: NodeJS.Timeout | undefined;

    try {
      const request: VideoGenerationRequest = {
        prompt: `${systemPrompt}\n\nUser Request: ${prompt}`,
        duration,
        aspectRatio,
        style
      };

      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + Math.random() * 15, 90),
          message: prev.progress && prev.progress > 50 
            ? 'Rendering final video...' 
            : 'Processing AI model...',
          estimatedTimeRemaining: prev.estimatedTimeRemaining ? Math.max(prev.estimatedTimeRemaining - 10, 5) : undefined
        }));
      }, 2000);

      // Make API call
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Video generation failed');
      }

      // Success!
      setProgress({
        status: 'completed',
        progress: 100,
        message: 'Video generated successfully!'
      });

      // Create video object
      const newVideo: GeneratedVideo = {
        id: generateVideoId(),
        prompt,
        videoUrl: result.videoUrl,
        createdAt: new Date(),
        duration,
        aspectRatio,
        style: style !== 'default' ? style : undefined
      };

      setGeneratedVideo(newVideo);
      saveVideoToHistory(newVideo);

      toast.success('Video generated successfully!');

    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      console.error('Generation error:', error);
      
      setProgress({
        status: 'error',
        message: error instanceof Error ? error.message : 'Generation failed'
      });

      toast.error(error instanceof Error ? error.message : 'Failed to generate video');
    }
  };

  const handleSuggestionSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    toast.success('Prompt selected! Click Generate to create your video.');
  };

  const handleHistorySelect = (video: GeneratedVideo) => {
    setGeneratedVideo(video);
    setPrompt(video.prompt);
    if (video.duration) setDuration(video.duration);
    if (video.aspectRatio) setAspectRatio(video.aspectRatio);
    if (video.style) setStyle(video.style);
    
    setProgress({ status: 'completed' });
    toast.info('Video loaded from history');
  };

  const isGenerating = progress.status === 'generating';
  const canGenerate = prompt.trim().length >= 10 && !isGenerating;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Video Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Transform your ideas into stunning videos using advanced AI technology
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Generation Card */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Create Video</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Prompt Configuration */}
              <div className="space-y-2">
                <Label htmlFor="system-prompt" className="text-sm font-medium">
                  System Prompt (Customizable)
                </Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Configure how the AI should approach video generation..."
                  className="min-h-20 text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize the AI's behavior and focus for video generation
                </p>
              </div>

              {/* Main Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Video Description
                </Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to create... (e.g., 'A peaceful sunset over calm ocean waves with seagulls flying')"
                  className="min-h-24"
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Be as detailed as possible for best results</span>
                  <span>{prompt.length}/500</span>
                </div>
              </div>

              {/* Generation Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Duration</Label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_STYLES.map((styleOption) => (
                        <SelectItem key={styleOption.value} value={styleOption.value}>
                          {styleOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Generating Video...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span>Generate Video</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <ProgressIndicator progress={progress} />

          {/* Video Preview */}
          {generatedVideo && (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Generated Video</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {generatedVideo.prompt}
                </p>
              </CardHeader>
              <CardContent>
                <VideoPreview
                  videoUrl={generatedVideo.videoUrl}
                  title={generatedVideo.prompt}
                  onError={(error) => toast.error(`Video error: ${error}`)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="suggestions" className="mt-4">
              <PromptSuggestions onSuggestionSelect={handleSuggestionSelect} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <GenerationHistory onVideoSelect={handleHistorySelect} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;