import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  Plus,
  Trash2,
  Eye,
  Headphones,
  FileImage,
  BookOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usesIndividualAudio, usesPassageAudio } from '@/utils/audioUtils';
import * as XLSX from 'xlsx';

interface TOEICQuestion {
  id?: string;
  part: number; // TOEIC Part (1-7)
  prompt_text: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correct_choice: string;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  passage_id?: string;
  passage_title?: string;
  passage_content?: string;
  blank_index?: number;
  audio_url?: string;
  transcript?: string;
  image_url?: string;
  validation_status: 'pending' | 'valid' | 'invalid' | 'imported';
  errors?: string[];
}

interface TOEICPassage {
  part: number;
  passage_type: 'single' | 'double' | 'triple';
  title: string;
  content: string;
  additional?: string;
  audio_url?: string;
  topic?: string;
  word_count?: number;
}

interface TOEICBulkUploadProps {
  onQuestionsImported?: (count: number) => void;
  className?: string;
}

const TOEIC_PART_INFO = {
  1: { name: 'Photos', description: 'Mô tả hình ảnh', type: 'listening', count: 6 },
  2: { name: 'Question-Response', description: 'Hỏi đáp ngắn', type: 'listening', count: 25 },
  3: { name: 'Conversations', description: 'Hội thoại ngắn', type: 'listening', count: 39 },
  4: { name: 'Talks', description: 'Bài nói dài', type: 'listening', count: 30 },
  5: { name: 'Incomplete Sentences', description: 'Hoàn thành câu', type: 'reading', count: 30 },
  6: { name: 'Text Completion', description: 'Hoàn thành đoạn văn', type: 'reading', count: 16 },
  7: { name: 'Reading Comprehension', description: 'Đọc hiểu', type: 'reading', count: 54 }
};

const TOEICBulkUpload: React.FC<TOEICBulkUploadProps> = ({
  onQuestionsImported,
  className = ''
}) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<TOEICQuestion[]>([]);
  const [passages, setPassages] = useState<TOEICPassage[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      // ===== PART 1: PHOTOS (LISTENING) =====
      // Mô tả hình ảnh - image_url và choices là tùy chọn
      {
        part: 1,
        prompt_text: '', // Part 1 không cần prompt_text
        choiceA: 'A man is reading a book', // Tùy chọn - có thể để trống
        choiceB: 'A woman is cooking dinner', // Tùy chọn - có thể để trống
        choiceC: 'A child is playing with toys', // Tùy chọn - có thể để trống
        choiceD: 'A dog is sleeping on the couch', // Tùy chọn - có thể để trống
        correct_choice: 'A',
        explain_vi: 'Trong hình, một người đàn ông đang đọc sách.',
        explain_en: 'In the picture, a man is reading a book.',
        tags: 'photos,listening,part1',
        difficulty: 'easy',
        status: 'published',
        image_url: 'https://example.com/image1.jpg', // Tùy chọn
        audio_url: 'https://example.com/audio1.mp3' // Tùy chọn
      },

      // ===== PART 2: QUESTION-RESPONSE (LISTENING) =====
      // Hỏi đáp ngắn - chỉ có A, B, C - prompt_text và choices tùy chọn
      {
        part: 2,
        prompt_text: '', // Tùy chọn - có thể để trống
        choiceA: 'It\'s on the second floor', // Tùy chọn - có thể để trống
        choiceB: 'Yes, I can help you', // Tùy chọn - có thể để trống
        choiceC: 'The meeting starts at 3 PM', // Tùy chọn - có thể để trống
        choiceD: '', // Part 2 không cần choice D
        correct_choice: 'A',
        explain_vi: 'Câu trả lời phù hợp nhất cho câu hỏi về vị trí.',
        explain_en: 'The most appropriate response to a location question.',
        tags: 'question-response,listening,part2',
        difficulty: 'easy',
        status: 'published',
        audio_url: 'https://example.com/audio2.mp3', // Khuyến khích
        image_url: '' // Part 2 không cần image
      },

      // ===== PART 2: QUESTION-RESPONSE (LISTENING) - CHỈ RADIO BUTTONS =====
      // Chỉ có A, B, C - không có mô tả chi tiết
      {
        part: 2,
        prompt_text: '', // Để trống
        choiceA: '', // Để trống - chỉ chọn A, B, C
        choiceB: '', // Để trống - chỉ chọn A, B, C
        choiceC: '', // Để trống - chỉ chọn A, B, C
        choiceD: '', // Part 2 không cần choice D
        correct_choice: 'B',
        explain_vi: 'Đây là câu hỏi Part 2 không có mô tả chi tiết, chỉ chọn đáp án.',
        explain_en: 'This is a Part 2 question with no detailed description, just select the answer.',
        tags: 'question-response,listening,part2,no-description',
        difficulty: 'easy',
        status: 'published',
        audio_url: 'https://example.com/audio3.mp3', // Khuyến khích
        image_url: '' // Part 2 không cần image
      },

      // ===== PART 3: CONVERSATIONS (LISTENING) =====
      // Hội thoại ngắn - cần passage_id (UUID của passage đã có trong database)
      {
        part: 3,
        prompt_text: 'What are the speakers discussing?',
        choiceA: 'A business proposal',
        choiceB: 'A vacation plan',
        choiceC: 'A new product launch',
        choiceD: 'A job interview',
        correct_choice: 'A',
        explain_vi: 'Người nói đang thảo luận về đề xuất kinh doanh.',
        explain_en: 'The speakers are discussing a business proposal.',
        tags: 'conversations,listening,part3',
        difficulty: 'medium',
        status: 'published',
        passage_id: '67272638-1f31-477c-a351-a354fda9581b', // UUID của passage đã có
        audio_url: 'https://example.com/conversation1.mp3' // Tùy chọn
      },

      // ===== PART 4: TALKS (LISTENING) =====
      // Bài nói dài - cần passage_id (UUID của passage đã có trong database)
      {
        part: 4,
        prompt_text: 'What is the main topic of the announcement?',
        choiceA: 'New compunknown policies',
        choiceB: 'Upcoming training sessions',
        choiceC: 'Office renovation plans',
        choiceD: 'Employee benefits update',
        correct_choice: 'B',
        explain_vi: 'Thông báo chính về các buổi đào tạo sắp tới.',
        explain_en: 'The main topic is about upcoming training sessions.',
        tags: 'talks,listening,part4',
        difficulty: 'easy',
        status: 'published',
        passage_id: 'a55bf808-26bc-405e-b3c4-3b4672e1dce5', // UUID của passage đã có
        audio_url: 'https://example.com/talk1.mp3' // Tùy chọn
      },

      // ===== PART 5: INCOMPLETE SENTENCES (READING) =====
      // Hoàn thành câu - không cần passage
      {
        part: 5,
        prompt_text: 'The meeting _____ postponed until next week.',
        choiceA: 'has been',
        choiceB: 'will be',
        choiceC: 'is being',
        choiceD: 'was',
        correct_choice: 'A',
        explain_vi: 'Câu này cần thì hiện tại hoàn thành bị động.',
        explain_en: 'This sentence needs present perfect passive tense.',
        tags: 'grammar,reading,part5',
        difficulty: 'medium',
        status: 'published'
      },

      // ===== PART 6: TEXT COMPLETION (READING) =====
      // Hoàn thành đoạn văn - cần passage_title, passage_content, blank_index
      {
        part: 6,
        prompt_text: 'What is the best word to fill in the first blank?',
        choiceA: 'Our',
        choiceB: 'Their',
        choiceC: 'Its',
        choiceD: 'Your',
        correct_choice: 'A',
        explain_vi: 'Chỗ trống đầu tiên cần đại từ sở hữu "Our" để chỉ công ty đang nói.',
        explain_en: 'The first blank needs possessive pronoun "Our" to refer to the compunknown speaking.',
        tags: 'text-completion,reading,part6',
        difficulty: 'medium',
        status: 'published',
        blank_index: 1,
        passage_title: 'Compunknown Newsletter',
        passage_content: 'Dear Employees, We are pleased to announce that _____ compunknown has achieved record sales this quarter. _____ we continue to grow, we are looking for talented individuals to join our team.'
      },

      // ===== PART 7: READING COMPREHENSION (READING) =====
      // Đọc hiểu - cần passage_title, passage_content
      {
        part: 7,
        prompt_text: 'According to the passage, what is the main purpose of the compunknown?',
        choiceA: 'To increase profits',
        choiceB: 'To provide quality service',
        choiceC: 'To expand globally',
        choiceD: 'To reduce costs',
        correct_choice: 'B',
        explain_vi: 'Theo đoạn văn, mục đích chính của công ty là cung cấp dịch vụ chất lượng.',
        explain_en: 'According to the passage, the main purpose of the compunknown is to provide quality service.',
        tags: 'reading,comprehension,part7',
        difficulty: 'easy',
        status: 'published',
        passage_title: 'Compunknown Mission',
        passage_content: 'TechCorp is committed to providing exceptional customer service and innovative solutions. Our mission is to help businesses grow through technology while maintaining the highest standards of quality and reliability.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TOEIC Questions');
    XLSX.writeFile(wb, 'toeic_questions_template.xlsx');

    toast({
      title: "Template downloaded",
      description: "Đã tải template Excel cho TOEIC questions",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 DEBUG: handleFileUpload started');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ DEBUG: No file selected');
      return;
    }

    console.log('📁 DEBUG: File selected:', file.name, file.size, 'bytes');
    setLoading(true);
    setQuestions([]);

    try {
      const data = await file.arrayBuffer();
      console.log('📊 DEBUG: File read, size:', data.byteLength, 'bytes');
      
      const workbook = XLSX.read(data);
      console.log('📋 DEBUG: Workbook sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('📝 DEBUG: JSON data rows:', jsonData.length);
      console.log('📝 DEBUG: First row keys:', Object.keys(jsonData[0] || {}));

      const parsedQuestions: TOEICQuestion[] = jsonData.map((row: unknown, index: number) => {
        // Debug log để xem dữ liệu thô
        if (index === 0) {
          console.log('🔍 Debug - Raw row data:', row);
          console.log('🔍 Debug - Row keys:', Object.keys(row));
        }

        const question: TOEICQuestion = {
          part: parseInt(row.part) || 1,
          prompt_text: row.prompt_text || row.question_text || '',
          choiceA: row.choiceA || '',
          choiceB: row.choiceB || '',
          choiceC: row.choiceC || '',
          choiceD: row.choiceD || '',
          correct_choice: row.correct_choice || row.answer || 'A',
          explain_vi: row.explain_vi || '',
          explain_en: row.explain_en || '',
          tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
          difficulty: row.difficulty || 'medium',
          status: row.status || 'draft',
          passage_id: row.passage_id || undefined,
          passage_title: row.passage_title || undefined,
          passage_content: row.passage_content || undefined,
          blank_index: row.blank_index ? parseInt(row.blank_index) : undefined,
          audio_url: row.audio_url || '',
          transcript: row.transcript || '',
          image_url: row.image_url || '',
          validation_status: 'pending',
          errors: []
        };

        // Debug log để xem parsed question
        if (index === 0) {
          console.log('🔍 Debug - Parsed question:', question);
        }

        // Validate question
        const errors: string[] = [];
        
        // Debug validation
        if (index === 0) {
          console.log('🔍 Debug - Validation checks:');
          console.log('  prompt_text:', question.prompt_text);
          console.log('  prompt_text.trim():', question.prompt_text.trim());
          console.log('  !prompt_text.trim():', !question.prompt_text.trim());
          console.log('  correct_choice:', question.correct_choice);
          console.log('  correct_choice.toUpperCase():', question.correct_choice.toUpperCase());
          console.log('  includes check:', ['A', 'B', 'C', 'D'].includes(question.correct_choice.toUpperCase()));
        }
        
        // Part 1 and Part 2 don't require prompt_text
        if (question.part !== 1 && question.part !== 2 && !question.prompt_text.trim()) {
          errors.push('Prompt text is required for parts 3-7');
        }
        
        // Part 1 and Part 2 choices are optional, other parts require at least A and B
        if (question.part === 1 || question.part === 2) {
          // Part 1 and Part 2 - choices are optional, no validation needed
        } else {
          if (!question.choiceA.trim() || !question.choiceB.trim()) {
            errors.push('At least choices A and B are required for parts 3-7');
          }
        }
        
        // Validate correct choice based on part
        if (question.part === 2) {
          if (!['A', 'B', 'C'].includes(question.correct_choice.toUpperCase())) {
            errors.push('Part 2 correct choice must be A, B, or C');
          }
        } else {
          if (!['A', 'B', 'C', 'D'].includes(question.correct_choice.toUpperCase())) {
            errors.push('Correct choice must be A, B, C, or D');
          }
        }
        
        if (question.part < 1 || question.part > 7) {
          errors.push('Part must be between 1 and 7');
        }
        
        if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
          errors.push('Difficulty must be easy, medium, or hard');
        }
        
        if (!['draft', 'published', 'archived'].includes(question.status)) {
          errors.push('Status must be draft, published, or archived');
        }

        // Validate part-specific requirements
        if ([3, 4, 6, 7].includes(question.part) && !question.passage_id) {
          errors.push(`Part ${question.part} requires a valid passage_id`);
        }
        
        if (question.part === 6 && !question.blank_index) {
          errors.push('Part 6 requires blank_index (1-4)');
        }
        
        // Part 1 - image_url and choices are optional
        // No additional validation needed for Part 1

        question.errors = errors;
        question.validation_status = errors.length === 0 ? 'valid' : 'invalid';

        // Debug final result
        if (index === 0) {
          console.log('🔍 Debug - Final result:');
          console.log('  errors:', errors);
          console.log('  validation_status:', question.validation_status);
        }

        return question;
      });

      console.log('✅ DEBUG: Parsed questions:', parsedQuestions.length);
      console.log('✅ DEBUG: Valid questions:', parsedQuestions.filter(q => q.validation_status === 'valid').length);
      console.log('✅ DEBUG: Invalid questions:', parsedQuestions.filter(q => q.validation_status === 'invalid').length);

      setQuestions(parsedQuestions);
      
      const validCount = parsedQuestions.filter(q => q.validation_status === 'valid').length;
      const invalidCount = parsedQuestions.filter(q => q.validation_status === 'invalid').length;

      toast({
        title: "File processed",
        description: `${validCount} valid questions, ${invalidCount} invalid questions`,
      });

    } catch (error) {
      console.error('❌ DEBUG: Error processing file:', error);
      console.error('❌ DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack');
      toast({
        title: "Error",
        description: "Failed to process Excel file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importQuestions = async () => {
    if (!user) return;

    const validQuestions = questions.filter(q => q.validation_status === 'valid');
    if (validQuestions.length === 0) {
      toast({
        title: "No valid questions",
        description: "Please fix invalid questions before importing",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      let importedCount = 0;
      const batchSize = 5; // Smaller batch for complex operations

      // Handle passages for Parts 3, 4, 6, 7 - Only use existing passages
      const passageMap = new Map<string, string>();
      
      // Collect all unique passage_ids first
      const passageIds = [...new Set(
        validQuestions
          .filter(q => [3, 4, 6, 7].includes(q.part) && q.passage_id)
          .map(q => q.passage_id)
      )];
      
      // Verify all passages exist in one query
      if (passageIds.length > 0) {
        const { data: existingPassages, error: passageError } = await supabase
          .from('passages')
          .select('id')
          .in('id', passageIds);
        
        if (passageError) {
          toast({
            title: "Error checking passages",
            description: "Failed to verify passage IDs. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Create map of existing passages
        if (existingPassages) {
          existingPassages.forEach(passage => {
            passageMap.set(passage.id, passage.id);
          });
        }
      }
      
      // Validate questions against existing passages
      for (const question of validQuestions) {
        if ([3, 4, 6, 7].includes(question.part)) {
          if (question.passage_id) {
            if (!passageMap.has(question.passage_id)) {
              // Passage not found - mark question as invalid
              question.validation_status = 'invalid';
              question.errors = question.errors || [];
              question.errors.push(`Passage with ID ${question.passage_id} not found`);
              continue;
            }
          } else {
            // No passage_id provided - mark question as invalid
            question.validation_status = 'invalid';
            question.errors = question.errors || [];
            question.errors.push(`Part ${question.part} questions require a valid passage_id`);
            continue;
          }
        }
      }

      // Filter out invalid questions after passage validation
      const finalValidQuestions = validQuestions.filter(q => q.validation_status === 'valid');
      
      if (finalValidQuestions.length === 0) {
        toast({
          title: "No valid questions",
          description: "All questions failed passage validation. Please check passage_id values.",
          variant: "destructive",
        });
        return;
      }

      // Then import questions
      for (let i = 0; i < finalValidQuestions.length; i += batchSize) {
        const batch = finalValidQuestions.slice(i, i + batchSize);
        
        const questionsToInsert = batch.map(q => {
          // Determine audio URL based on part
          let audioUrl = null;
          if (usesIndividualAudio(q.part)) {
            // Parts 1, 2: Use individual audio
            audioUrl = q.audio_url || null;
          } else if (usesPassageAudio(q.part)) {
            // Parts 3, 4: Audio comes from passage, not question
            audioUrl = null; // Will be handled by passage
          }
          // Parts 5, 6, 7: No audio

          return {
            part: q.part,
            passage_id: q.passage_id || null,
            blank_index: q.blank_index || null,
            prompt_text: q.part === 1 || q.part === 2 ? '' : q.prompt_text.trim(), // Part 1 and Part 2 don't need prompt_text
            choices: {
              A: q.choiceA.trim(),
              B: q.choiceB.trim(),
              C: q.choiceC.trim(),
              D: q.part === 2 ? '' : q.choiceD.trim() // Part 2 doesn't need choice D
            },
            correct_choice: q.correct_choice.toUpperCase(),
            explain_vi: q.explain_vi.trim(),
            explain_en: q.explain_en.trim(),
            tags: q.tags,
            difficulty: q.difficulty,
            status: q.status,
            image_url: q.image_url || null,
            audio_url: audioUrl, // Use calculated audio URL
            created_by: user.id
          };
        });

        const { error } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (error) throw error;

        importedCount += batch.length;
        setProgress((importedCount / finalValidQuestions.length) * 100);

        // Update status
        setQuestions(prev => prev.map(q => 
          batch.includes(q) ? { ...q, validation_status: 'imported' as const } : q
        ));

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast({
        title: "Import successful",
        description: `${importedCount} TOEIC questions imported successfully`,
      });

      onQuestionsImported?.(importedCount);

    } catch (error: unknown) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const getPartIcon = (part: number) => {
    if (part <= 4) return <Headphones className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  const getPartColor = (part: number) => {
    if (part <= 4) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const validCount = questions.filter(q => q.validation_status === 'valid').length;
  const invalidCount = questions.filter(q => q.validation_status === 'invalid').length;
  const importedCount = questions.filter(q => q.validation_status === 'imported').length;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            TOEIC Parts Upload
          </CardTitle>
          <CardDescription>
            Upload TOEIC questions organized by Parts (1-7) with proper validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Upload TOEIC Questions Excel file
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: .xlsx, .xls
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Template Download */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Download TOEIC Template</p>
                    <p className="text-sm">
                      Use our template to ensure proper formatting for TOEIC Parts 1-7
                    </p>
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              {/* TOEIC Parts Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(TOEIC_PART_INFO).map(([part, info]) => (
                  <Card key={part} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        Part {part}: {info.name}
                        {getPartIcon(parseInt(part))}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">{info.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className={getPartColor(parseInt(part))}>
                          {info.type}
                        </Badge>
                        <span className="text-muted-foreground">{info.count} questions</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            {/* Preview Section */}
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Processing file...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No questions to preview</p>
                  <p className="text-sm text-muted-foreground">Upload an Excel file first</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Valid</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{validCount}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Invalid</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{invalidCount}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Imported</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{importedCount}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Import Button */}
                  {validCount > 0 && (
                    <div className="flex justify-center">
                      <Button 
                        onClick={importQuestions} 
                        disabled={importing}
                        size="lg"
                      >
                        {importing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Importing... ({Math.round(progress)}%)
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Import {validCount} Questions
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {importing && (
                    <Progress value={progress} className="w-full" />
                  )}

                  {/* Questions List */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.map((question, index) => (
                      <Card key={index} className={`border-l-4 ${
                        question.validation_status === 'valid' ? 'border-l-green-500' :
                        question.validation_status === 'invalid' ? 'border-l-red-500' :
                        'border-l-blue-500'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={getPartColor(question.part)}>
                                  Part {question.part}
                                </Badge>
                                <Badge variant="outline">{question.difficulty}</Badge>
                                {question.validation_status === 'valid' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {question.validation_status === 'invalid' && <AlertCircle className="h-4 w-4 text-red-600" />}
                                {question.validation_status === 'imported' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                              </div>
                            </div>

                            {/* Question */}
                            <div>
                              {question.part === 1 ? (
                                <p className="font-medium text-sm text-blue-600">Part 1: Photos - Không có câu hỏi text</p>
                              ) : question.part === 2 ? (
                                <p className="font-medium text-sm text-green-600">Part 2: Question-Response - Chỉ có A, B, C</p>
                              ) : (
                                <p className="font-medium text-sm">{question.prompt_text}</p>
                              )}
                            </div>

                            {/* Choices */}
                            <div className={`grid gap-2 text-xs ${question.part === 2 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                              <div className={`p-2 rounded ${question.correct_choice === 'A' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                                A. {question.choiceA || (question.part === 1 || question.part === 2 ? 'Chọn đáp án này' : 'Lựa chọn A')}
                              </div>
                              <div className={`p-2 rounded ${question.correct_choice === 'B' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                                B. {question.choiceB || (question.part === 1 || question.part === 2 ? 'Chọn đáp án này' : 'Lựa chọn B')}
                              </div>
                              <div className={`p-2 rounded ${question.correct_choice === 'C' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                                C. {question.choiceC || (question.part === 1 || question.part === 2 ? 'Chọn đáp án này' : 'Lựa chọn C')}
                              </div>
                              {question.part !== 2 && (
                                <div className={`p-2 rounded ${question.correct_choice === 'D' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                                  D. {question.choiceD || (question.part === 1 ? 'Chọn đáp án này' : 'Lựa chọn D')}
                                </div>
                              )}
                            </div>

                            {/* Errors */}
                            {question.errors && question.errors.length > 0 && (
                              <div className="text-xs text-red-600">
                                <strong>Errors:</strong> {question.errors.join(', ')}
                              </div>
                            )}

                            {/* Additional Info */}
                            {(question.audio_url || question.transcript || question.image_url) && (
                              <div className="text-xs text-muted-foreground">
                                {question.audio_url && <span className="mr-2">🎵 Audio</span>}
                                {question.transcript && <span className="mr-2">📝 Transcript</span>}
                                {question.image_url && <span className="mr-2">🖼️ Image</span>}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TOEICBulkUpload;
