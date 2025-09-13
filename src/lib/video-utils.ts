import { GeneratedVideo } from '@/types/video';

export const ASPECT_RATIOS = [
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '21:9', label: 'Cinematic (21:9)' }
];

export const VIDEO_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'animation', label: 'Animation' },
  { value: 'realistic', label: 'Realistic' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'futuristic', label: 'Futuristic' }
];

export const DURATION_OPTIONS = [
  { value: 3, label: '3 seconds' },
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' }
];

export const validateVideoPrompt = (prompt: string): { isValid: boolean; error?: string } => {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, error: 'Prompt is required' };
  }
  
  if (prompt.length < 10) {
    return { isValid: false, error: 'Prompt must be at least 10 characters long' };
  }
  
  if (prompt.length > 500) {
    return { isValid: false, error: 'Prompt must be less than 500 characters' };
  }
  
  return { isValid: true };
};

export const generateVideoId = (): string => {
  return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const downloadVideo = async (videoUrl: string, filename?: string): Promise<void> => {
  try {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `video_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download video');
  }
};

export const getVideoHistoryFromStorage = (): GeneratedVideo[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('video_generation_history');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  } catch (error) {
    console.error('Error loading video history:', error);
    return [];
  }
};

export const saveVideoToHistory = (video: GeneratedVideo): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getVideoHistoryFromStorage();
    const newHistory = [video, ...history].slice(0, 10); // Keep only last 10 videos
    localStorage.setItem('video_generation_history', JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error saving video to history:', error);
  }
};

export const clearVideoHistory = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('video_generation_history');
  } catch (error) {
    console.error('Error clearing video history:', error);
  }
};

export const isValidVideoUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('.mp4') || url.includes('/video/') || url.includes('video');
  } catch {
    return false;
  }
};