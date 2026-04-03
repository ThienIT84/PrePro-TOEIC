import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { isAudioRequired, usesIndividualAudio, usesPassageAudio } from '@/utils/audioUtils';
import { TOEICPart, Difficulty, CorrectChoice, PassageType } from '@/types';
import { X, Plus, Upload, FileText, Headphones, BookOpen } from 'lucide-react';

interface TOEICQuestionCreatorProps {
  onSuccess?: () => void;
}

const TOEIC_PART_INFO = {
  1: { name: 'Part 1: Photos', description: 'Mô tả hình ảnh', icon: '📷', needsPassage: false },
  2: { name: 'Part 2: Question-Response', description: 'Hỏi đáp', icon: '💬', needsPassage: false },
  3: { name: 'Part 3: Conversations', description: 'Hội thoại', icon: '👥', needsPassage: true },
  4: { name: 'Part 4: Talks', description: 'Bài nói', icon: '🎤', needsPassage: true },
  5: { name: 'Part 5: Incomplete Sentences', description: 'Hoàn thành câu', icon: '✏️', needsPassage: false },
  6: { name: 'Part 6: Text Completion', description: 'Hoàn thành đoạn văn', icon: '📝', needsPassage: true },
  7: { name: 'Part 7: Reading Comprehension', description: 'Đọc hiểu', icon: '📖', needsPassage: true },
};

const TOEICQuestionCreator: React.FC<TOEICQuestionCreatorProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('question');
  
  // Question form data
  const [questionData, setQuestionData] = useState({
    part: 1 as TOEICPart,
    difficulty: 'medium' as Difficulty,
    prompt_text: '',
    choices: { A: '', B: '', C: '', D: '' },
    correct_choice: 'A' as CorrectChoice,
    explain_vi: '',
    explain_en: '',
    tags: [] as string[],
    blank_index: null as number | null,
    image_url: '',
    audio_url: '',
  });

  // Passage form data (for Parts 3, 4, 6, 7)
  const [passageData, setPassageData] = useState({
    part: 3 as TOEICPart,
    passage_type: 'single' as PassageType,
    texts: { title: '', content: '', additional: '' },
    translation_vi: { content: '' },
    translation_en: { content: '' },
    audio_url: '',
    assets: { images: [] as string[], charts: [] as string[] },
    meta: { word_count: 0, reading_time: 0, topic: '' },
  });

  const [newTag, setNewTag] = useState('');
  const [passages, setPassages] = useState<any[]>([]);
  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(null);

  // Load passages when part changes
  useEffect(() => {
    if (TOEIC_PART_INFO[questionData.part].needsPassage) {
      loadPassages(questionData.part);
    }
  }, [questionData.part]);

  const loadPassages = async (part: TOEICPart) => {
    try {
      const { data, error } = await supabase
        .from('passages')
        .select('*')
        .eq('part', part)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPassages(data || []);
    } catch (error) {
      console.error('Error loading passages:', error);
    }
  };

  const handleQuestionChange = (field: string, value: any) => {
    setQuestionData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Reset choices when part changes
      if (field === 'part') {
        newData.choices = { A: '', B: '', C: '', D: '' };
        newData.correct_choice = 'A';
      }
      
      return newData;
    });
  };

  const handleChoiceChange = (choice: string, value: string) => {
    setQuestionData(prev => ({
      ...prev,
      choices: {
        ...prev.choices,
        [choice]: value
      }
    }));
  };

  const handlePassageChange = (field: string, value: any) => {
    setPassageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePassageTextChange = (field: string, value: string) => {
    setPassageData(prev => ({
      ...prev,
      texts: {
        ...prev.texts,
        [field]: value
      }
    }));
  };

  const handleTranslationChange = (language: 'vi' | 'en', value: string) => {
    setPassageData(prev => ({
      ...prev,
      [`translation_${language}`]: {
        content: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !questionData.tags.includes(newTag.trim())) {
      setQuestionData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setQuestionData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const createPassage = async () => {
    if (!passageData.texts.content.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung đoạn văn',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('passages')
        .insert({
          part: passageData.part,
          passage_type: passageData.passage_type,
          texts: passageData.texts,
          translation_vi: passageData.translation_vi.content ? passageData.translation_vi : null,
          translation_en: passageData.translation_en.content ? passageData.translation_en : null,
          audio_url: passageData.audio_url || null,
          assets: passageData.assets,
          meta: passageData.meta,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã tạo đoạn văn thành công',
      });

      // Reset form
      setPassageData({
        part: 3 as TOEICPart,
        passage_type: 'single' as PassageType,
        texts: { title: '', content: '', additional: '' },
        translation_vi: { content: '' },
        translation_en: { content: '' },
        audio_url: '',
        assets: { images: [], charts: [] },
        meta: { word_count: 0, reading_time: 0, topic: '' },
      });

      // Reload passages
      loadPassages(passageData.part);
    } catch (error) {
      console.error('Error creating passage:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo đoạn văn',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async () => {
    // Validation
    if (questionData.part !== 1 && questionData.part !== 2 && !questionData.prompt_text.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập câu hỏi',
        variant: 'destructive',
      });
      return;
    }

    // Validation for choices based on part
    if (questionData.part === 1) {
      // Part 1 - choices are optional, just need to select correct answer
      // No validation required for choices content
    } else if (questionData.part === 2) {
      // Part 2 - choices are optional, just need to select correct answer (A, B, or C)
      // No validation required for choices content
    } else {
      // Other parts require at least 2 choices with meaningful content
      const choices = questionData.choices;
      if (!choices.A.trim() || !choices.B.trim()) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng nhập ít nhất 2 lựa chọn A và B',
          variant: 'destructive',
        });
        return;
      }
      
      // Check for meaningful content
      const meaningfulChoices = [choices.A, choices.B].filter(
        choice => choice.trim().length > 0 && /[a-zA-ZÀ-ỹ0-9]/.test(choice.trim())
      );
      
      if (meaningfulChoices.length < 2) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng nhập lựa chọn có ý nghĩa cho ít nhất A và B',
          variant: 'destructive',
        });
        return;
      }
    }

    // Validation for explanations
    if (!questionData.explain_vi.trim() || !questionData.explain_en.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập giải thích bằng tiếng Việt và tiếng Anh',
        variant: 'destructive',
      });
      return;
    }
    
    // Check for meaningful explanations
    const hasMeaningfulExplainVi = /[a-zA-ZÀ-ỹ0-9]/.test(questionData.explain_vi.trim());
    const hasMeaningfulExplainEn = /[a-zA-ZÀ-ỹ0-9]/.test(questionData.explain_en.trim());
    
    if (!hasMeaningfulExplainVi || !hasMeaningfulExplainEn) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập giải thích có ý nghĩa bằng cả tiếng Việt và tiếng Anh',
        variant: 'destructive',
      });
      return;
    }

    // Optional URL validation for image and audio
    if (questionData.image_url.trim()) {
      try {
        new URL(questionData.image_url.trim());
      } catch {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng nhập link ảnh hợp lệ (bắt đầu bằng http:// hoặc https://)',
          variant: 'destructive',
        });
        return;
      }
    }
    
    if (questionData.audio_url.trim()) {
      try {
        new URL(questionData.audio_url.trim());
      } catch {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng nhập link audio hợp lệ (bắt đầu bằng http:// hoặc https://)',
          variant: 'destructive',
        });
        return;
      }
    }

    // For Parts 3, 4, 6, 7, require passage
    if (TOEIC_PART_INFO[questionData.part].needsPassage && !selectedPassageId) {
      toast({
        title: 'Lỗi',
        description: `Phần ${questionData.part} cần chọn đoạn văn`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Determine audio URL based on part
      let audioUrl = null;
      if (usesIndividualAudio(questionData.part)) {
        // Parts 1, 2: Use individual audio
        audioUrl = questionData.audio_url || null;
      } else if (usesPassageAudio(questionData.part)) {
        // Parts 3, 4: Audio comes from passage, not question
        audioUrl = null; // Will be handled by passage
      }
      // Parts 5, 6, 7: No audio

      const { data, error } = await supabase
        .from('questions')
        .insert({
          part: questionData.part,
          passage_id: selectedPassageId,
          blank_index: questionData.blank_index,
          prompt_text: questionData.part === 1 || questionData.part === 2 ? '' : questionData.prompt_text,
          choices: questionData.choices,
          correct_choice: questionData.correct_choice,
          explain_vi: questionData.explain_vi,
          explain_en: questionData.explain_en,
          tags: questionData.tags,
          difficulty: questionData.difficulty,
          image_url: questionData.image_url || null,
          audio_url: audioUrl, // Use calculated audio URL
          status: 'published',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã tạo câu hỏi thành công',
      });

      // Reset form
      setQuestionData({
        part: 1 as TOEICPart,
        difficulty: 'medium' as Difficulty,
        prompt_text: '',
        choices: { A: '', B: '', C: '', D: '' },
        correct_choice: 'A' as CorrectChoice,
        explain_vi: '',
        explain_en: '',
        tags: [],
        blank_index: null,
        image_url: '',
        audio_url: '',
      });
      setSelectedPassageId(null);

      onSuccess?.();
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentPartInfo = TOEIC_PART_INFO[questionData.part];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{currentPartInfo.icon}</span>
            Tạo câu hỏi TOEIC - {currentPartInfo.name}
          </CardTitle>
          <p className="text-muted-foreground">{currentPartInfo.description}</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="question">Câu hỏi</TabsTrigger>
              {currentPartInfo.needsPassage && (
                <TabsTrigger value="passage">Đoạn văn</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="question" className="space-y-6">
              {/* Part Selection */}
              <div className="space-y-2">
                <Label>Phần thi TOEIC</Label>
                <Select value={questionData.part.toString()} onValueChange={(value) => handleQuestionChange('part', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TOEIC_PART_INFO).map(([part, info]) => (
                      <SelectItem key={part} value={part}>
                        <div className="flex items-center gap-2">
                          <span>{info.icon}</span>
                          <span>{info.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label>Độ khó</Label>
                <Select value={questionData.difficulty} onValueChange={(value: Difficulty) => handleQuestionChange('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image URL for Part 1 */}
              {questionData.part === 1 && (
                <div className="space-y-2">
                  <Label>Link ảnh (tùy chọn cho Part 1)</Label>
                  <Input
                    value={questionData.image_url}
                    onChange={(e) => handleQuestionChange('image_url', e.target.value)}
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
                    onChange={(e) => handleQuestionChange('audio_url', e.target.value)}
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
                  <Select value={questionData.blank_index?.toString() || ''} onValueChange={(value) => handleQuestionChange('blank_index', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vị trí chỗ trống" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Chỗ trống 1</SelectItem>
                      <SelectItem value="2">Chỗ trống 2</SelectItem>
                      <SelectItem value="3">Chỗ trống 3</SelectItem>
                      <SelectItem value="4">Chỗ trống 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Passage Selection for Parts 3, 4, 6, 7 */}
              {currentPartInfo.needsPassage && (
                <div className="space-y-2">
                  <Label>Chọn đoạn văn</Label>
                  <Select value={selectedPassageId || ''} onValueChange={setSelectedPassageId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đoạn văn" />
                    </SelectTrigger>
                    <SelectContent>
                      {passages.map((passage) => {
                        const p = passage as any;
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{p.texts?.title || `Đoạn văn ${p.id?.slice(0, 8)}`}</span>
                              <span className="text-sm text-muted-foreground">
                                {p.passage_type} • {p.texts?.content?.slice(0, 50)}...
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
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
                    onChange={(e) => handleQuestionChange('prompt_text', e.target.value)}
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
                    onChange={(e) => handleQuestionChange('prompt_text', e.target.value)}
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
                {(questionData.part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']).map((choice) => (
                  <div key={choice} className="flex items-center gap-2">
                    <Label className="w-8 font-medium">{choice}.</Label>
                    <Input
                      value={questionData.choices[choice]}
                      onChange={(e) => handleChoiceChange(choice, e.target.value)}
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
                      onChange={(e) => handleQuestionChange('correct_choice', e.target.value as CorrectChoice)}
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
                    onChange={(e) => handleQuestionChange('explain_vi', e.target.value)}
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
                    onChange={(e) => handleQuestionChange('explain_en', e.target.value)}
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
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Thêm tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {questionData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={createQuestion} disabled={loading} className="w-full">
                {loading ? 'Đang tạo...' : 'Tạo câu hỏi'}
              </Button>
            </TabsContent>

            {currentPartInfo.needsPassage && (
              <TabsContent value="passage" className="space-y-6">
                <div className="space-y-2">
                  <Label>Loại đoạn văn</Label>
                  <Select value={passageData.passage_type} onValueChange={(value: PassageType) => handlePassageChange('passage_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Đoạn đơn</SelectItem>
                      <SelectItem value="double">Đoạn đôi</SelectItem>
                      <SelectItem value="triple">Đoạn ba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tiêu đề (tùy chọn)</Label>
                  <Input
                    value={passageData.texts.title}
                    onChange={(e) => handlePassageTextChange('title', e.target.value)}
                    placeholder="Tiêu đề đoạn văn..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nội dung chính</Label>
                  <Textarea
                    value={passageData.texts.content}
                    onChange={(e) => handlePassageTextChange('content', e.target.value)}
                    placeholder="Nhập nội dung đoạn văn..."
                    rows={6}
                  />
                </div>

                {(passageData.passage_type === 'double' || passageData.passage_type === 'triple') && (
                  <div className="space-y-2">
                    <Label>Nội dung bổ sung</Label>
                    <Textarea
                      value={passageData.texts.additional}
                      onChange={(e) => handlePassageTextChange('additional', e.target.value)}
                      placeholder="Nhập nội dung bổ sung..."
                      rows={4}
                    />
                  </div>
                )}

                {/* Translation Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bản dịch tiếng Việt (tùy chọn)</Label>
                    <Textarea
                      value={passageData.translation_vi.content}
                      onChange={(e) => handleTranslationChange('vi', e.target.value)}
                      placeholder="Nhập bản dịch tiếng Việt..."
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bản dịch tiếng Anh (tùy chọn)</Label>
                    <Textarea
                      value={passageData.translation_en.content}
                      onChange={(e) => handleTranslationChange('en', e.target.value)}
                      placeholder="Enter English translation..."
                      rows={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Audio URL (tùy chọn)</Label>
                  <Input
                    value={passageData.audio_url}
                    onChange={(e) => handlePassageChange('audio_url', e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Số từ</Label>
                    <Input
                      type="number"
                      value={passageData.meta.word_count}
                      onChange={(e) => handlePassageChange('meta', { ...passageData.meta, word_count: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thời gian đọc (phút)</Label>
                    <Input
                      type="number"
                      value={passageData.meta.reading_time}
                      onChange={(e) => handlePassageChange('meta', { ...passageData.meta, reading_time: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chủ đề</Label>
                    <Input
                      value={passageData.meta.topic}
                      onChange={(e) => handlePassageChange('meta', { ...passageData.meta, topic: e.target.value })}
                      placeholder="Chủ đề..."
                    />
                  </div>
                </div>

                <Button onClick={createPassage} disabled={loading} className="w-full">
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

export default TOEICQuestionCreator;
