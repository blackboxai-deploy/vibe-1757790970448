export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: string;
  style?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  message?: string;
  jobId?: string;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
  duration?: number;
  aspectRatio?: string;
  style?: string;
}

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress?: number;
  message?: string;
  estimatedTimeRemaining?: number;
}

export interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onError?: (error: string) => void;
  className?: string;
}

export interface PromptSuggestion {
  id: string;
  title: string;
  prompt: string;
  category: string;
}