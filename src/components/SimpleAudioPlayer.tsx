import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2 } from 'lucide-react';

interface SimpleAudioPlayerProps {
  audioUrl: string;
  transcript?: string;
  className?: string;
}

const SimpleAudioPlayer = ({ audioUrl, transcript, className = "" }: SimpleAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Không thể phát audio');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          preload="metadata"
          onError={() => setError('Không thể tải audio')}
          onEnded={() => setIsPlaying(false)}
        />
        
        {error && (
          <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Simple Play Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="px-8 py-3 text-lg"
              size="lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Tạm dừng
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Phát audio
                </>
              )}
            </Button>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Transcript:</h4>
              <p className="text-sm text-muted-foreground italic">
                "{transcript}"
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleAudioPlayer;
