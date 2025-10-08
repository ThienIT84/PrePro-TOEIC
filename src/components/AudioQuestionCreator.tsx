import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileAudio, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  Save,
  Plus,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AudioUpload from '@/components/AudioUpload';
import { AudioStorageService, AudioFileInfo } from '@/services/audioStorageService';
import { supabase } from '@/integrations/supabase/client';

interface QuestionFormData {
  type: 'vocab' | 'grammar' | 'listening' | 'reading' | 'mix';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  choices: string[];
  answer: string;
  explain_vi: string;
  explain_en: string;
  audio_url?: string;
  transcript?: string;
  tags: string[];
}

interface AudioQuestionCreatorProps {
  onQuestionCreated?: (question: unknown) => void;
  className?: string;
}

const AudioQuestionCreator: React.FC<AudioQuestionCreatorProps> = ({
  onQuestionCreated,
  className = ''
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<QuestionFormData>({
    type: 'listening',
    difficulty: 'medium',
    question: '',
    choices: ['', '', '', ''],
    answer: 'A',
    explain_vi: '',
    explain_en: '',
    audio_url: '',
    transcript: '',
    tags: []
  });

  const [isCreating, setIsCreating] = useState(false);
  const [uploadedAudio, setUploadedAudio] = useState<AudioFileInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Handle audio upload completion
  const handleAudioUploadComplete = async (files: unknown[]) => {
    if (files.length === 0 || !user) return;

    const file = files[0];
    if (file.status === 'completed' && file.url) {
      // Create AudioFileInfo object
      const audioInfo: AudioFileInfo = {
        id: file.id,
        name: file.name,
        url: file.url,
        size: file.size,
        duration: file.duration || 0,
        format: 'audio/mp3', // Default format
        uploadedAt: new Date().toISOString(),
        userId: user.id
      };

      setUploadedAudio(audioInfo);
      setFormData(prev => ({ ...prev, audio_url: file.url }));
      
      toast({
        title: "Audio uploaded successfully",
        description: `${file.name} has been uploaded`,
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof QuestionFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle choice changes
  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData(prev => ({ ...prev, choices: newChoices }));
  };

  // Add new choice
  const addChoice = () => {
    if (formData.choices.length < 6) {
      setFormData(prev => ({ 
        ...prev, 
        choices: [...prev.choices, ''] 
      }));
    }
  };

  // Remove choice
  const removeChoice = (index: number) => {
    if (formData.choices.length > 2) {
      const newChoices = formData.choices.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, choices: newChoices }));
    }
  };

  // Handle tag changes
  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked 
      ? [...formData.tags, tag]
      : formData.tags.filter(t => t !== tag);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  // Play/pause audio
  const toggleAudio = () => {
    if (!uploadedAudio) return;

    if (!audioElement) {
      const audio = new Audio(uploadedAudio.url);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    }

    if (isPlaying) {
      audioElement?.pause();
      setIsPlaying(false);
    } else {
      audioElement?.play();
      setIsPlaying(true);
    }
  };

  // Create question
  const handleCreateQuestion = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create questions",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!formData.question.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'listening' && !formData.audio_url) {
      toast({
        title: "Validation Error",
        description: "Audio file is required for listening questions",
        variant: "destructive",
      });
      return;
    }

    if (formData.choices.filter(c => c.trim()).length < 2) {
      toast({
        title: "Validation Error",
        description: "At least 2 choices are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          type: formData.type,
          difficulty: formData.difficulty,
          question: formData.question.trim(),
          choices: formData.choices.filter(c => c.trim()),
          answer: formData.answer,
          explain_vi: formData.explain_vi.trim(),
          explain_en: formData.explain_en.trim(),
          audio_url: formData.audio_url || null,
          transcript: formData.transcript?.trim() || null,
          tags: formData.tags
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Question created successfully",
      });

      // Reset form
      setFormData({
        type: 'listening',
        difficulty: 'medium',
        question: '',
        choices: ['', '', '', ''],
        answer: 'A',
        explain_vi: '',
        explain_en: '',
        audio_url: '',
        transcript: '',
        tags: []
      });
      setUploadedAudio(null);
      setAudioElement(null);
      setIsPlaying(false);

      onQuestionCreated?.(data);

    } catch (error: unknown) {
      console.error('Create question error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const availableTags = [
    'vocabulary', 'grammar', 'listening', 'reading', 'business', 'travel',
    'education', 'technology', 'health', 'entertainment', 'shopping', 'food'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Create Audio Question
          </CardTitle>
          <CardDescription>
            Create TOEIC listening questions with audio files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Question Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: unknown) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="listening">Listening</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="vocab">Vocabulary</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="mix">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value: unknown) => handleInputChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (400-500)</SelectItem>
                      <SelectItem value="medium">Medium (500-700)</SelectItem>
                      <SelectItem value="hard">Hard (700+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  placeholder="Enter the question text..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <AudioUpload
                onUploadComplete={handleAudioUploadComplete}
                maxFiles={1}
                maxSize={10}
                acceptedFormats={['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg']}
              />

              {uploadedAudio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Uploaded Audio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <FileAudio className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{uploadedAudio.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(uploadedAudio.size / 1024)} KB • {uploadedAudio.duration}s
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAudio}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="transcript">Transcript (Optional)</Label>
                <Textarea
                  id="transcript"
                  value={formData.transcript}
                  onChange={(e) => handleInputChange('transcript', e.target.value)}
                  placeholder="Enter the audio transcript..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>Answer Choices</Label>
                <div className="space-y-2 mt-2">
                  {formData.choices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Label className="w-8 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </Label>
                      <Input
                        value={choice}
                        onChange={(e) => handleChoiceChange(index, e.target.value)}
                        placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                      />
                      {formData.choices.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChoice(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.choices.length < 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addChoice}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Choice
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="answer">Correct Answer</Label>
                <Select 
                  value={formData.answer} 
                  onValueChange={(value) => handleInputChange('answer', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.choices.map((_, index) => (
                      <SelectItem key={index} value={String.fromCharCode(65 + index)}>
                        {String.fromCharCode(65 + index)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="explain_vi">Vietnamese Explanation</Label>
                  <Textarea
                    id="explain_vi"
                    value={formData.explain_vi}
                    onChange={(e) => handleInputChange('explain_vi', e.target.value)}
                    placeholder="Giải thích bằng tiếng Việt..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="explain_en">English Explanation</Label>
                  <Textarea
                    id="explain_en"
                    value={formData.explain_en}
                    onChange={(e) => handleInputChange('explain_en', e.target.value)}
                    placeholder="Explanation in English..."
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={formData.tags.includes(tag)}
                        onCheckedChange={(checked) => 
                          handleTagChange(tag, checked as boolean)
                        }
                      />
                      <Label htmlFor={tag} className="text-sm">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={handleCreateQuestion}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-current"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Question
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioQuestionCreator;
