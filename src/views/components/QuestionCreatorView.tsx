/**
 * QuestionCreatorView
 * Pure UI component cho TOEIC Question Creator
 * Nhận tất cả data và callbacks qua props
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TOEICPart, Difficulty, CorrectChoice, PassageType } from '@/types';
import { X, Plus } from 'lucide-react';

export interface QuestionCreatorViewProps {
  // State
  questionData: {
    part: TOEICPart;
    difficulty: Difficulty;
    prompt_text: string;
    choices: { A: string; B: string; C: string; D: string };
    correct_choice: CorrectChoice;
    explain_vi: string;
    explain_en: string;
    tags: string[];
    blank_index: number | null;
    image_url: string;
    audio_url: string;
  };
  passageData: {
    part: TOEICPart;
    passage_type: PassageType;
    texts: { title: string; content: string; additional: string };
    audio_url: string;
    assets: { images: string[]; charts: string[] };
    meta: { word_count: number; reading_time: number; topic: string };
  };
  loading: boolean;
  activeTab: 'question' | 'passage';
  passages: unknown[];
  selectedPassageId: string | null;
  newTag: string;
  errors: string[];

  // Handlers
  onQuestionChange: (field: string, value: unknown) => void;
  onChoiceChange: (choice: string, value: string) => void;
  onPassageChange: (field: string, value: unknown) => void;
  onPassageTextChange: (field: string, value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onSetNewTag: (value: string) => void;
  onSetActiveTab: (tab: 'question' | 'passage') => void;
  onSetSelectedPassageId: (passageId: string | null) => void;
  onCreateQuestion: () => void;
  onCreatePassage: () => void;

  // Utility functions
  getCurrentPartInfo: () => unknown;
  needsPassage: (part: TOEICPart) => boolean;
  usesIndividualAudio: (part: TOEICPart) => boolean;
  usesPassageAudio: (part: TOEICPart) => boolean;
  isAudioRequired: (part: TOEICPart) => boolean;
  getAvailableChoices: (part: TOEICPart) => string[];
  getBlankIndexOptions: () => Array<{ value: number; label: string }>;
  getPassageTypeOptions: () => Array<{ value: PassageType; label: string }>;
  getDifficultyOptions: () => Array<{ value: Difficulty; label: string }>;
  getToeicPartInfo: () => unknown;
}

export const QuestionCreatorView: React.FC<QuestionCreatorViewProps> = ({
  questionData,
  passageData,
  loading,
  activeTab,
  passages,
  selectedPassageId,
  newTag,
  errors,
  onQuestionChange,
  onChoiceChange,
  onPassageChange,
  onPassageTextChange,
  onAddTag,
  onRemoveTag,
  onSetNewTag,
  onSetActiveTab,
  onSetSelectedPassageId,
  onCreateQuestion,
  onCreatePassage,
  getCurrentPartInfo,
  needsPassage,
  usesIndividualAudio,
  usesPassageAudio,
  isAudioRequired,
  getAvailableChoices,
  getBlankIndexOptions,
  getPassageTypeOptions,
  getDifficultyOptions,
  getToeicPartInfo,
}) => {
  const currentPartInfo = getCurrentPartInfo();
  const toeicPartInfo = getToeicPartInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{(currentPartInfo as any)?.icon || '📝'}</span>
            Tạo câu hỏi TOEIC - {(currentPartInfo as any)?.name || 'Unknown Part'}
          </CardTitle>
          <p className="text-muted-foreground">{(currentPartInfo as any)?.description || ''}</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={onSetActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="question">Câu hỏi</TabsTrigger>
              {(currentPartInfo as any)?.needsPassage && (
                <TabsTrigger value="passage">Đoạn văn</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="question" className="space-y-6">
              {/* Part Selection */}
              <div className="space-y-2">
                <Label>Phần thi TOEIC</Label>
                <Select value={questionData.part.toString()} onValueChange={(value) => onQuestionChange('part', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(toeicPartInfo).map(([part, info]: [string, unknown]) => (
                      <SelectItem key={part} value={part}>
                        <div className="flex items-center gap-2">
                          <span>{(info as any)?.icon || '📝'}</span>
                          <span>{(info as any)?.name || 'Unknown Part'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label>Độ khó</Label>
                <Select value={questionData.difficulty} onValueChange={(value: Difficulty) => onQuestionChange('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getDifficultyOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image URL for Part 1 */}
              {questionData.part === 1 && (
                <div className="space-y-2">
                  <Label>Link ảnh (tùy chọn cho Part 1)</Label>
                  <Input
                    value={questionData.image_url}
                    onChange={(e) => onQuestionChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                  {questionData.image_url && (
                    <div className="mt-2">
                      <Label className="text-sm text-muted-foreground">Preview ảnh:</Label>
                      <div className="mt-1 border rounded-lg p-2">
                        <img 
                          src={questionData.image_url} 
                          alt="Preview" 
                          className="max-w-full h-auto rounded object-contain"
                          style={{ maxHeight: '300px' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-sm text-red-500">
                          Không thể tải ảnh. Vui lòng kiểm tra lại URL.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Audio URL - Only show for Parts 1, 2 */}
              {usesIndividualAudio(questionData.part) && (
                <div className="space-y-2">
                  <Label>Link Audio (tùy chọn)</Label>
                  <Input
                    value={questionData.audio_url}
                    onChange={(e) => onQuestionChange('audio_url', e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    type="url"
                  />
                  <p className="text-sm text-muted-foreground">
                    Audio riêng cho câu hỏi này
                  </p>
                  {questionData.audio_url && (
                    <div className="mt-2">
                      <Label className="text-sm text-muted-foreground">Preview Audio:</Label>
                      <div className="mt-1">
                        <audio 
                          controls 
                          className="w-full"
                          onError={(e) => {
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        >
                          <source src={questionData.audio_url} type="audio/mpeg" />
                          <source src={questionData.audio_url} type="audio/wav" />
                          <source src={questionData.audio_url} type="audio/ogg" />
                          Trình duyệt không hỗ trợ audio.
                        </audio>
                        <div className="hidden text-sm text-red-500 mt-1">
                          Không thể tải audio. Vui lòng kiểm tra lại URL.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Audio info for Parts 3, 4 */}
              {usesPassageAudio(questionData.part) && (
                <div className="space-y-2">
                  <Label>Audio</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Audio sẽ được lấy từ đoạn văn đã chọn. 
                      Hãy đảm bảo đoạn văn có audio URL.
                    </p>
                  </div>
                </div>
              )}

              {/* No audio info for Parts 5, 6, 7 */}
              {!isAudioRequired(questionData.part) && (
                <div className="space-y-2">
                  <Label>Audio</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Phần {questionData.part} không cần audio.
                    </p>
                  </div>
                </div>
              )}

              {/* Blank Index for Part 6 */}
              {questionData.part === 6 && (
                <div className="space-y-2">
                  <Label>Vị trí chỗ trống</Label>
                  <Select value={questionData.blank_index?.toString() || ''} onValueChange={(value) => onQuestionChange('blank_index', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vị trí chỗ trống" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBlankIndexOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Passage Selection for Parts 3, 4, 6, 7 */}
              {(currentPartInfo as any)?.needsPassage && (
                <div className="space-y-2">
                  <Label>Chọn đoạn văn</Label>
                  <Select value={selectedPassageId || ''} onValueChange={onSetSelectedPassageId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đoạn văn" />
                    </SelectTrigger>
                    <SelectContent>
                      {passages.map((passage) => (
                        <SelectItem key={(passage as any)?.id} value={(passage as any)?.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{(passage as any)?.texts?.title || `Đoạn văn ${(passage as any)?.id?.slice(0, 8) || 'Unknown'}`}</span>
                            <span className="text-sm text-muted-foreground">
                              {(passage as any)?.passage_type || 'Unknown'} • {(passage as any)?.texts?.content?.slice(0, 50) || 'No content'}...
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {passages.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Chưa có đoạn văn nào cho phần {questionData.part}. Hãy tạo đoạn văn trước.
                    </p>
                  )}
                </div>
              )}

              {/* Question Text - Hidden for Part 1 */}
              {questionData.part !== 1 && questionData.part !== 2 && (
                <div className="space-y-2">
                  <Label>Câu hỏi</Label>
                  <Textarea
                    value={questionData.prompt_text}
                    onChange={(e) => onQuestionChange('prompt_text', e.target.value)}
                    placeholder="Nhập câu hỏi..."
                    rows={3}
                  />
                </div>
              )}

              {/* Part 2 - Optional question text */}
              {questionData.part === 2 && (
                <div className="space-y-2">
                  <Label>Câu hỏi (tùy chọn)</Label>
                  <Textarea
                    value={questionData.prompt_text}
                    onChange={(e) => onQuestionChange('prompt_text', e.target.value)}
                    placeholder="Nhập câu hỏi (tùy chọn)..."
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Có thể để trống nếu chỉ muốn học sinh nghe audio và chọn đáp án.
                  </p>
                </div>
              )}

              {/* Part 1 Instructions - No question text needed */}
              {questionData.part === 1 && (
                <div className="space-y-2">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Part 1 - Photos:</strong> Học sinh sẽ nhìn vào ảnh và chọn câu mô tả đúng nhất. 
                      Bạn cần tạo 4 mô tả khác nhau về ảnh này (A, B, C, D).
                    </p>
                  </div>
                </div>
              )}

              {/* Part 2 Instructions - Question-Response */}
              {questionData.part === 2 && (
                <div className="space-y-2">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Part 2 - Question-Response:</strong> Học sinh sẽ nghe câu hỏi và chọn câu trả lời phù hợp nhất. 
                      Bạn có thể tạo 3 câu trả lời khác nhau (A, B, C) hoặc để trống để học sinh chỉ chọn A, B, C.
                    </p>
                  </div>
                </div>
              )}

              {/* Choices */}
              <div className="space-y-4">
                <Label>
                  {questionData.part === 1 ? 'Mô tả ảnh (tùy chọn)' : 
                   questionData.part === 2 ? 'Câu trả lời (tùy chọn)' : 'Lựa chọn'}
                </Label>
                {questionData.part === 1 && (
                  <p className="text-sm text-muted-foreground">
                    Có thể tạo 4 câu mô tả khác nhau về ảnh (tùy chọn). Nếu không nhập, học sinh sẽ chỉ thấy 4 lựa chọn A, B, C, D.
                  </p>
                )}
                {questionData.part === 2 && (
                  <p className="text-sm text-muted-foreground">
                    Có thể tạo 3 câu trả lời khác nhau (tùy chọn). Nếu không nhập, học sinh sẽ chỉ thấy 3 lựa chọn A, B, C.
                  </p>
                )}
                {getAvailableChoices(questionData.part).map((choice) => (
                  <div key={choice} className="flex items-center gap-2">
                    <Label className="w-8 font-medium">{choice}.</Label>
                    <Input
                      value={questionData.choices[choice]}
                      onChange={(e) => onChoiceChange(choice, e.target.value)}
                      placeholder={
                        questionData.part === 1 
                          ? `Mô tả ${choice} về ảnh (tùy chọn)...` 
                          : questionData.part === 2
                          ? `Câu trả lời ${choice} (tùy chọn)...`
                          : `Lựa chọn ${choice}`
                      }
                      className={
                        questionData.choices[choice].trim() && 
                        !/[a-zA-ZÀ-ỹ0-9]/.test(questionData.choices[choice].trim())
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    />
                    <input
                      type="radio"
                      name="correct_choice"
                      value={choice}
                      checked={questionData.correct_choice === choice}
                      onChange={(e) => onQuestionChange('correct_choice', e.target.value as CorrectChoice)}
                      className="ml-2"
                    />
                    <Label className="text-sm">Đúng</Label>
                    {questionData.choices[choice].trim() && 
                     !/[a-zA-ZÀ-ỹ0-9]/.test(questionData.choices[choice].trim()) &&
                     questionData.part !== 1 && questionData.part !== 2 && (
                      <span className="text-xs text-red-500 ml-2">
                        Cần nhập nội dung có ý nghĩa
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giải thích (Tiếng Việt)</Label>
                  <Textarea
                    value={questionData.explain_vi}
                    onChange={(e) => onQuestionChange('explain_vi', e.target.value)}
                    placeholder="Giải thích bằng tiếng Việt..."
                    rows={3}
                    className={
                      questionData.explain_vi.trim() && 
                      !/[a-zA-ZÀ-ỹ0-9]/.test(questionData.explain_vi.trim())
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {questionData.explain_vi.trim() && 
                   !/[a-zA-ZÀ-ỹ0-9]/.test(questionData.explain_vi.trim()) && (
                    <span className="text-xs text-red-500">
                      Cần nhập giải thích có ý nghĩa
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Giải thích (Tiếng Anh)</Label>
                  <Textarea
                    value={questionData.explain_en}
                    onChange={(e) => onQuestionChange('explain_en', e.target.value)}
                    placeholder="Explanation in English..."
                    rows={3}
                    className={
                      questionData.explain_en.trim() && 
                      !/[a-zA-ZÀ-ỹ0-9]/.test(questionData.explain_en.trim())
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {questionData.explain_en.trim() && 
                   !/[a-zA-ZÀ-ỹ0-9]/.test(questionData.explain_en.trim()) && (
                    <span className="text-xs text-red-500">
                      Cần nhập giải thích có ý nghĩa
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => onSetNewTag(e.target.value)}
                    placeholder="Thêm tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
                  />
                  <Button type="button" onClick={onAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {questionData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={onCreateQuestion} disabled={loading} className="w-full">
                {loading ? 'Đang tạo...' : 'Tạo câu hỏi'}
              </Button>
            </TabsContent>

            {(currentPartInfo as any)?.needsPassage && (
              <TabsContent value="passage" className="space-y-6">
                <div className="space-y-2">
                  <Label>Loại đoạn văn</Label>
                  <Select value={passageData.passage_type} onValueChange={(value: PassageType) => onPassageChange('passage_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getPassageTypeOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tiêu đề (tùy chọn)</Label>
                  <Input
                    value={passageData.texts.title}
                    onChange={(e) => onPassageTextChange('title', e.target.value)}
                    placeholder="Tiêu đề đoạn văn..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nội dung chính</Label>
                  <Textarea
                    value={passageData.texts.content}
                    onChange={(e) => onPassageTextChange('content', e.target.value)}
                    placeholder="Nhập nội dung đoạn văn..."
                    rows={6}
                  />
                </div>

                {(passageData.passage_type === 'double' || passageData.passage_type === 'triple') && (
                  <div className="space-y-2">
                    <Label>Nội dung bổ sung</Label>
                    <Textarea
                      value={passageData.texts.additional}
                      onChange={(e) => onPassageTextChange('additional', e.target.value)}
                      placeholder="Nhập nội dung bổ sung..."
                      rows={4}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Audio URL (tùy chọn)</Label>
                  <Input
                    value={passageData.audio_url}
                    onChange={(e) => onPassageChange('audio_url', e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Số từ</Label>
                    <Input
                      type="number"
                      value={passageData.meta.word_count}
                      onChange={(e) => onPassageChange('meta', { ...passageData.meta, word_count: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thời gian đọc (phút)</Label>
                    <Input
                      type="number"
                      value={passageData.meta.reading_time}
                      onChange={(e) => onPassageChange('meta', { ...passageData.meta, reading_time: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chủ đề</Label>
                    <Input
                      value={passageData.meta.topic}
                      onChange={(e) => onPassageChange('meta', { ...passageData.meta, topic: e.target.value })}
                      placeholder="Chủ đề..."
                    />
                  </div>
                </div>

                <Button onClick={onCreatePassage} disabled={loading} className="w-full">
                  {loading ? 'Đang tạo...' : 'Tạo đoạn văn'}
                </Button>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
