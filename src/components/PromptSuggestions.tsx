'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptSuggestion } from '@/types/video';

const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: '1',
    title: 'Ocean Waves',
    prompt: 'Serene ocean waves gently crashing on a pristine beach at sunset, with golden light reflecting on the water',
    category: 'Nature'
  },
  {
    id: '2',
    title: 'City Timelapse',
    prompt: 'Fast-paced timelapse of a bustling city street with cars and people moving, neon lights illuminating the night',
    category: 'Urban'
  },
  {
    id: '3',
    title: 'Forest Walk',
    prompt: 'Peaceful walk through a lush green forest with sunlight filtering through tall trees and leaves rustling',
    category: 'Nature'
  },
  {
    id: '4',
    title: 'Space Journey',
    prompt: 'Mesmerizing journey through space with stars, nebulas, and distant galaxies slowly rotating',
    category: 'Sci-Fi'
  },
  {
    id: '5',
    title: 'Coffee Shop',
    prompt: 'Cozy coffee shop scene with steam rising from a cup, soft lighting, and blurred background of people',
    category: 'Lifestyle'
  },
  {
    id: '6',
    title: 'Mountain Landscape',
    prompt: 'Majestic mountain range with snow-capped peaks, clouds moving across the sky, and alpine meadows',
    category: 'Nature'
  },
  {
    id: '7',
    title: 'Abstract Art',
    prompt: 'Flowing abstract shapes and vibrant colors morphing and blending together in smooth transitions',
    category: 'Abstract'
  },
  {
    id: '8',
    title: 'Robot Assembly',
    prompt: 'Futuristic robot being assembled in a high-tech laboratory with mechanical arms and glowing components',
    category: 'Sci-Fi'
  }
];

interface PromptSuggestionsProps {
  onSuggestionSelect: (prompt: string) => void;
  className?: string;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSuggestionSelect, className }) => {
  const categories = Array.from(new Set(PROMPT_SUGGESTIONS.map(s => s.category)));

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Prompt Suggestions
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Get inspired with these creative video prompts
        </p>
      </div>

      <div className="space-y-6">
        {categories.map(category => (
          <div key={category}>
            <div className="flex items-center mb-3">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            </div>
            
            <div className="grid gap-3">
              {PROMPT_SUGGESTIONS
                .filter(suggestion => suggestion.category === category)
                .map(suggestion => (
                <Card 
                  key={suggestion.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-slate-200 dark:border-slate-700"
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {suggestion.prompt}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSuggestionSelect(suggestion.prompt)}
                        className="w-full text-xs h-8 mt-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Use This Prompt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Click any prompt to use it, or create your own unique description
        </p>
      </div>
    </div>
  );
};

export default PromptSuggestions;