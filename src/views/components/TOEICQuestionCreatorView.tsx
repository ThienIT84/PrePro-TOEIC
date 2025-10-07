import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TOEICQuestionCreatorController, QuestionCreateData, PassageCreateData } from '@/controllers/question/TOEICQuestionCreatorController';
import { TOEICPart, Difficulty, CorrectChoice, PassageType } from '@/types';
import { X, Plus, Upload, FileText, Headphones, BookOpen, Loader2 } from 'lucide-react';

interface TOEICQuestionCreatorViewProps {
  controller: TOEICQuestionCreatorController;
  state: {
    questionData: QuestionCreateData;
    passageData: PassageCreateData;
    passages: any[];
    selectedPassageId: string | null;
    loading: boolean;
    error: string | null;
    activeTab: 'question' | 'passage';
  };
  onQuestionDataChange: (data: Partial<QuestionCreateData>) => void;
  onPassageDataChange: (data: Partial<PassageCreateData>) => void;
  onActiveTabChange: (tab: 'question' | 'passage') => void;
  onPassageSelect: (passageId: string | null) => void;
  onQuestionSubmit: (data: QuestionCreateData) => void;
  onPassageSubmit: (data: PassageCreateData) => void;
  onAudioUpload: (file: File) => void;
  onImageUpload: (file: File) => void;
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onReset: () => void;
}

export const TOEICQuestionCreatorView: React.FC<TOEICQuestionCreatorViewProps> = ({
  controller,
  state,
  onQuestionDataChange,
  onPassageDataChange,
  onActiveTabChange,
  onPassageSelect,
  onQuestionSubmit,
  onPassageSubmit,
  onAudioUpload,
  onImageUpload,
  onTagAdd,
  onTagRemove,
  onReset
}) => {
  const [newTag, setNewTag] = useState('');

  const { questionData, passageData, passages, selectedPassageId, loading, error, activeTab } = state;

  // Event Handlers
  const handleQuestionChange = (field: keyof QuestionCreateData, value: any) => {
    onQuestionDataChange({ [field]: value });
  };

  const handlePassageChange = (field: keyof PassageCreateData, value: any) => {
    onPassageDataChange({ [field]: value });
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuestionSubmit(questionData);
  };

  const handlePassageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPassageSubmit(passageData);
  };

  const handleFileUpload = (type: 'audio' | 'image', file: File) => {
    if (type === 'audio') {
      onAudioUpload(file);
    } else {
      onImageUpload(file);
    }
  };

  const handleTagAdd = () => {
    if (newTag.trim()) {
      onTagAdd(newTag.trim());
      setNewTag('');
    }
  };

  const handleTagRemove = (tag: string) => {
    onTagRemove(tag);
  };

  // Render Methods
  const renderLoading = () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Loading...</span>
    </div>
  );

  const renderError = () => (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  const renderQuestionForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Question
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleQuestionSubmit} className="space-y-6">
          {/* TOEIC Part Selection */}
          <div className="space-y-2">
            <Label htmlFor="part">TOEIC Part *</Label>
            <Select
              value={questionData.part.toString()}
              onValueChange={(value) => handleQuestionChange('part', parseInt(value) as TOEICPart)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select TOEIC part" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((part) => {
                  const partInfo = controller.getPartInfo(part as TOEICPart);
                  return (
                    <SelectItem key={part} value={part.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{partInfo.icon}</span>
                        <span>{partInfo.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level *</Label>
            <Select
              value={questionData.difficulty}
              onValueChange={(value) => handleQuestionChange('difficulty', value as Difficulty)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt_text">Question Prompt *</Label>
            <Textarea
              id="prompt_text"
              value={questionData.prompt_text}
              onChange={(e) => handleQuestionChange('prompt_text', e.target.value)}
              placeholder="Enter question prompt..."
              rows={4}
              required
            />
          </div>

          {/* Answer Choices */}
          <div className="space-y-4">
            <Label>Answer Choices *</Label>
            {['A', 'B', 'C', 'D'].map((choice) => (
              <div key={choice} className="flex items-center gap-2">
                <Label className="w-8">{choice}.</Label>
                <Input
                  value={questionData.choices[choice as keyof typeof questionData.choices]}
                  onChange={(e) => handleQuestionChange('choices', {
                    ...questionData.choices,
                    [choice]: e.target.value
                  })}
                  placeholder={`Option ${choice}`}
                  required
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label htmlFor="correct_choice">Correct Answer *</Label>
            <Select
              value={questionData.correct_choice}
              onValueChange={(value) => handleQuestionChange('correct_choice', value as CorrectChoice)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audio Upload (for listening parts) */}
          {controller.isAudioRequired(questionData.part) && (
            <div className="space-y-2">
              <Label>Audio File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Headphones className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Click to upload audio
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('audio', file);
                    }}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  MP3, WAV, M4A up to 10MB
                </p>
                {questionData.audio_url && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-green-600">✓ Audio uploaded</span>
                    <button
                      type="button"
                      onClick={() => handleQuestionChange('audio_url', '')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passage Selection (for parts that need it) */}
          {controller.needsPassage(questionData.part) && (
            <div className="space-y-2">
              <Label>Select Passage *</Label>
              <Select
                value={selectedPassageId || ''}
                onValueChange={(value) => onPassageSelect(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a passage" />
                </SelectTrigger>
                <SelectContent>
                  {passages.map((passage) => (
                    <SelectItem key={passage.id} value={passage.id}>
                      {passage.texts?.title || `Passage ${passage.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              />
              <Button type="button" onClick={handleTagAdd} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {questionData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="explain_vi">Vietnamese Explanation</Label>
              <Textarea
                id="explain_vi"
                value={questionData.explain_vi}
                onChange={(e) => handleQuestionChange('explain_vi', e.target.value)}
                placeholder="Vietnamese explanation..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="explain_en">English Explanation</Label>
              <Textarea
                id="explain_en"
                value={questionData.explain_en}
                onChange={(e) => handleQuestionChange('explain_en', e.target.value)}
                placeholder="English explanation..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onReset} disabled={loading}>
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Question'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderPassageForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Create Passage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePassageSubmit} className="space-y-6">
          {/* TOEIC Part */}
          <div className="space-y-2">
            <Label htmlFor="passage_part">TOEIC Part *</Label>
            <Select
              value={passageData.part.toString()}
              onValueChange={(value) => handlePassageChange('part', parseInt(value) as TOEICPart)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select TOEIC part" />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 6, 7].map((part) => {
                  const partInfo = controller.getPartInfo(part as TOEICPart);
                  return (
                    <SelectItem key={part} value={part.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{partInfo.icon}</span>
                        <span>{partInfo.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Passage Type */}
          <div className="space-y-2">
            <Label htmlFor="passage_type">Passage Type *</Label>
            <Select
              value={passageData.passage_type}
              onValueChange={(value) => handlePassageChange('passage_type', value as PassageType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select passage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Passage</SelectItem>
                <SelectItem value="double">Double Passage</SelectItem>
                <SelectItem value="triple">Triple Passage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={passageData.texts.title}
              onChange={(e) => handlePassageChange('texts', {
                ...passageData.texts,
                title: e.target.value
              })}
              placeholder="Enter passage title..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={passageData.texts.content}
              onChange={(e) => handlePassageChange('texts', {
                ...passageData.texts,
                content: e.target.value
              })}
              placeholder="Enter passage content..."
              rows={8}
              required
            />
          </div>

          {/* Additional Content */}
          <div className="space-y-2">
            <Label htmlFor="additional">Additional Content</Label>
            <Textarea
              id="additional"
              value={passageData.texts.additional}
              onChange={(e) => handlePassageChange('texts', {
                ...passageData.texts,
                additional: e.target.value
              })}
              placeholder="Enter additional content..."
              rows={4}
            />
          </div>

          {/* Audio Upload */}
          <div className="space-y-2">
            <Label>Audio File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Headphones className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="passage-audio-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">
                    Click to upload audio
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <input
                  id="passage-audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('audio', file);
                  }}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                MP3, WAV, M4A up to 10MB
              </p>
              {passageData.audio_url && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-green-600">✓ Audio uploaded</span>
                  <button
                    type="button"
                    onClick={() => handlePassageChange('audio_url', '')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={passageData.meta.topic}
              onChange={(e) => handlePassageChange('meta', {
                ...passageData.meta,
                topic: e.target.value
              })}
              placeholder="Enter topic..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onReset} disabled={loading}>
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Passage'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">TOEIC Question Creator</h1>
        <p className="text-gray-600 mt-2">Create questions and passages for TOEIC practice</p>
      </div>

      {loading && renderLoading()}
      {error && renderError()}

      <Tabs value={activeTab} onValueChange={(value) => onActiveTabChange(value as 'question' | 'passage')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="question" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Question
          </TabsTrigger>
          <TabsTrigger value="passage" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Passage
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="question" className="mt-6">
          {renderQuestionForm()}
        </TabsContent>
        
        <TabsContent value="passage" className="mt-6">
          {renderPassageForm()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
