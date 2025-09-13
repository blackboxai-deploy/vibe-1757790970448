import { NextRequest, NextResponse } from 'next/server';
import { VideoGenerationRequest, VideoGenerationResponse } from '@/types/video';
import { validateVideoPrompt } from '@/lib/video-utils';
import { VideoGenerationAPI } from '@/lib/api-client';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: VideoGenerationRequest = await request.json();
    
    // Validate the prompt
    const validation = validateVideoPrompt(body.prompt);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
        message: 'Invalid prompt'
      } as VideoGenerationResponse, { status: 400 });
    }

    // Set default values if not provided
    const videoRequest: VideoGenerationRequest = {
      prompt: body.prompt.trim(),
      duration: body.duration || 5,
      aspectRatio: body.aspectRatio || '16:9',
      style: body.style || 'default'
    };

    console.log('Generating video with request:', videoRequest);

    // Generate video using the API client
    const result = await VideoGenerationAPI.generateVideo(videoRequest);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message || 'Video generation failed'
      } as VideoGenerationResponse, { status: 500 });
    }

    console.log('Video generation successful:', result);

    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      message: result.message || 'Video generated successfully'
    } as VideoGenerationResponse, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Internal server error occurred'
    } as VideoGenerationResponse, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Video Generation API',
    status: 'active',
    endpoints: {
      POST: '/api/generate-video - Generate a video from text prompt'
    }
  });
}