import { VideoGenerationRequest, VideoGenerationResponse } from '@/types/video';

export const API_CONFIG = {
  endpoint: 'https://oi-server.onrender.com/chat/completions',
  headers: {
    'customerId': 'cus_SA2gBNcLX2KKjm',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  model: 'replicate/google/veo-3',
  timeout: 15 * 60 * 1000 // 15 minutes
};

export class VideoGenerationAPI {
  private static createPrompt(request: VideoGenerationRequest): string {
    let prompt = request.prompt;
    
    // Add style modifier if specified
    if (request.style && request.style !== 'default') {
      prompt += `, ${request.style} style`;
    }
    
    // Add duration information if specified
    if (request.duration) {
      prompt += `, ${request.duration} seconds duration`;
    }
    
    // Add aspect ratio information if specified
    if (request.aspectRatio && request.aspectRatio !== '16:9') {
      prompt += `, ${request.aspectRatio} aspect ratio`;
    }
    
    return prompt;
  }

  static async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const prompt = this.createPrompt(request);
      
      const response = await fetch(API_CONFIG.endpoint, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Check if the response contains video content or URL
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        
        // If content is a URL or contains video data
        if (typeof content === 'string' && (content.startsWith('http') || content.includes('video'))) {
          return {
            success: true,
            videoUrl: content,
            message: 'Video generated successfully'
          };
        }
      }
      
      // Handle case where response format is different
      return {
        success: true,
        videoUrl: data.video_url || data.url || data.output,
        message: data.message || 'Video generated successfully'
      };
      
    } catch (error) {
      console.error('Video generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to generate video'
      };
    }
  }
}

export const generateVideoWithTimeout = async (
  request: VideoGenerationRequest,
  timeoutMs: number = API_CONFIG.timeout
): Promise<VideoGenerationResponse> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: 'Request timed out',
        message: 'Video generation took too long. Please try again with a shorter prompt.'
      });
    }, timeoutMs);

    VideoGenerationAPI.generateVideo(request)
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          error: error.message,
          message: 'Failed to generate video'
        });
      });
  });
};