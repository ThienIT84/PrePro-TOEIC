import { useState, useEffect, ChangeEvent } from 'react';
import { toast } from '@/hooks/use-toast';
import { DrillType, Difficulty, Question } from '@/types';
import { questionGeneratorService, GeneratedQuestion } from '@/services/questionGenerator';
import { groqQuestionGeneratorService } from '@/services/groqQuestionGenerator';
import { ollamaQuestionGeneratorService } from '@/services/ollamaQuestionGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  QuestionGeneratorFormData, 
  Part6ResultData, 
  Part7ResultData, 
  AIProvider, 
  OllamaStatus, 
  GeneratorTab 
} from '@/components/question-generator/types';

interface UseQuestionGeneratorOptions {
  onQuestionsGenerated?: (questions: Question[]) => void;
}

export const useQuestionGenerator = ({ onQuestionsGenerated }: UseQuestionGeneratorOptions = {}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<GeneratorTab>('text');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<QuestionGeneratorFormData>({
    content: '',
    type: 'mix',
    difficulty: 'medium',
    questionCount: 5,
    language: 'vi',
    part: 5
  });

  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [showPromptGuide, setShowPromptGuide] = useState(false);
  const [part6Result, setPart6Result] = useState<Part6ResultData | null>(null);
  const [part7Result, setPart7Result] = useState<Part7ResultData | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [passageCount, setPassageCount] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>('groq');
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('checking');
  const [ollamaModel, setOllamaModel] = useState('llama3:latest');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('groq_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    // Check Ollama connection
    checkOllamaConnection();
  }, []);

  // Check Ollama connection
  const checkOllamaConnection = async () => {
    setOllamaStatus('checking');
    try {
      const isConnected = await ollamaQuestionGeneratorService.checkConnection();
      if (isConnected) {
        setOllamaStatus('connected');
        // Get available models
        const models = await ollamaQuestionGeneratorService.getAvailableModels();
        setAvailableModels(models);
        // Filter out embedding models and set default
        const textModels = models.filter(m => !m.includes('embed'));
        if (textModels.length > 0) {
          setOllamaModel(textModels[0]);
        }
      } else {
        setOllamaStatus('disconnected');
      }
    } catch {
      setOllamaStatus('disconnected');
    }
  };

  // Save API key function
  const saveApiKey = () => {
    if (apiKey && apiKey.startsWith('gsk_')) {
      localStorage.setItem('groq_api_key', apiKey);
      // Update environment variable for current session
      (window as any).VITE_GROQ_API_KEY = apiKey;
      toast({
        title: 'Thành công',
        description: 'API key đã được lưu thành công!',
      });
    } else {
      toast({
        title: 'Lỗi',
        description: 'API key không hợp lệ. Vui lòng kiểm tra lại.',
        variant: 'destructive',
      });
    }
  };

  // Reset passageCount when changing parts
  useEffect(() => {
    if (formData.part !== 7) {
      setPassageCount(1);
    }
  }, [formData.part]);

  // Question selection handlers
  const toggleQuestionSelection = (index: number) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAllQuestions = () => {
    setSelectedQuestions(new Set(generatedQuestions.map((_, index) => index)));
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions(new Set());
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: 'Lỗi',
        description: 'Bạn cần đăng nhập để sử dụng tính năng này.',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(0);
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());
    
    // Clear previous results to prevent overlap
    setPart6Result(null);
    setPart7Result(null);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      let result;

      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Choose AI provider based on selection
      let service;
      if (aiProvider === 'ollama') {
        if (ollamaStatus !== 'connected') {
          throw new Error('Ollama chưa được kết nối. Vui lòng kiểm tra Ollama và thử lại.');
        }
        // Set the selected model
        ollamaQuestionGeneratorService.setModel(ollamaModel);
        service = ollamaQuestionGeneratorService;
      } else {
        // Groq provider
        groqQuestionGeneratorService.refreshApiKey();
        service = questionGeneratorService;
      }

      // Special handling for Part 6
      if (formData.part === 6) {
        if (!formData.content.trim()) {
          throw new Error('Vui lòng nhập nội dung để tạo câu hỏi Part 6');
        }
        
        const part6Res = await service.generatePart6Questions({
          content: formData.content,
          type: 'reading' as DrillType,
          difficulty: formData.difficulty as Difficulty,
          questionCount: 4, // Part 6 always has 4 questions
          language: formData.language
        });

        if (part6Res.success && part6Res.passage && part6Res.questions) {
          setPart6Result({
            passage: part6Res.passage,
            questions: part6Res.questions
          });
          setGeneratedQuestions(part6Res.questions);
          toast({
            title: 'Thành công!',
            description: `Đã tạo passage và ${part6Res.questions.length} câu hỏi Part 6.`
          });
        } else {
          console.error('Part 6 generation failed:', part6Res);
          throw new Error(part6Res.error || 'Không thể tạo câu hỏi Part 6. Vui lòng thử lại.');
        }
        return;
      }

      // Special handling for Part 7
      if (formData.part === 7) {
        if (!formData.content.trim()) {
          throw new Error('Vui lòng nhập nội dung để tạo câu hỏi Part 7');
        }
        
        const part7Res = await service.generatePart7Questions({
          content: formData.content,
          type: 'reading' as DrillType,
          difficulty: formData.difficulty as Difficulty,
          questionCount: formData.questionCount,
          language: formData.language,
          passageCount: passageCount
        });

        if (part7Res.success && part7Res.passages && part7Res.questions) {
          setPart7Result({
            passages: part7Res.passages,
            questions: part7Res.questions
          });
          setGeneratedQuestions(part7Res.questions);
          toast({
            title: 'Thành công!',
            description: `Đã tạo ${part7Res.passages.length} passage và ${part7Res.questions.length} câu hỏi Part 7.`
          });
        } else {
          console.error('Part 7 generation failed:', part7Res);
          throw new Error(part7Res.error || 'Không thể tạo câu hỏi Part 7. Vui lòng thử lại.');
        }
        return;
      }

      switch (activeTab) {
        case 'text':
          if (!formData.content.trim()) {
            throw new Error('Vui lòng nhập nội dung để tạo câu hỏi');
          }
          result = await service.generateQuestions({
            content: formData.content,
            type: formData.type as DrillType,
            difficulty: formData.difficulty as Difficulty,
            questionCount: formData.questionCount,
            language: formData.language
          });
          break;

        case 'file':
          if (!file) {
            throw new Error('Vui lòng chọn file để tạo câu hỏi');
          }
          result = await service.generateFromFile(file, {
            type: formData.type as DrillType,
            difficulty: formData.difficulty as Difficulty,
            questionCount: formData.questionCount,
            language: formData.language
          });
          break;

        case 'url':
          if (!url.trim()) {
            throw new Error('Vui lòng nhập URL để tạo câu hỏi');
          }
          result = await service.generateFromUrl(url, {
            type: formData.type as DrillType,
            difficulty: formData.difficulty as Difficulty,
            questionCount: formData.questionCount,
            language: formData.language
          });
          break;
      }

      if (progressInterval) clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.questions.length > 0) {
        setGeneratedQuestions(result.questions);
        toast({
          title: 'Thành công!',
          description: `Đã tạo ${result.questions.length} câu hỏi từ nội dung.`
        });
      } else {
        throw new Error(result.error || 'Không thể tạo câu hỏi');
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(msg);
      toast({
        title: 'Lỗi',
        description: msg,
        variant: 'destructive'
      });
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
    }
  };

  const handleSaveQuestions = async () => {
    if (!user || generatedQuestions.length === 0) return;

    // Check if Part 7 has generated passages
    if (formData.part === 7 && !part7Result) {
      toast({
        title: 'Lỗi',
        description: 'Part 7 cần có passage. Vui lòng tạo passage trước hoặc chọn Part khác.',
        variant: 'destructive'
      });
      return;
    }

    // Special handling for Part 6
    if (formData.part === 6 && part6Result) {
      try {
        // First create the passage
        const { data: passageData, error: passageError } = await supabase
          .from('passages')
          .insert({
            part: 6,
            passage_type: 'single',
            texts: {
              content: part6Result.passage.content
            },
            created_by: user.id
          })
          .select()
          .single();

        if (passageError) {
          throw passageError;
        }

        // Then create questions with passage_id
        const questionsToSave = part6Result.questions.map((q, index) => ({
          part: 6,
          passage_id: passageData.id,
          blank_index: index + 1,
          prompt_text: `Blank ${index + 1}`,
          choices: q.choices,
          correct_choice: q.answer,
          explain_vi: q.explain_vi,
          explain_en: q.explain_en,
          difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
          status: 'published',
          created_by: user.id,
          tags: q.tags,
          audio_url: null,
          transcript: null,
          image_url: null
        }));

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToSave);

        if (questionsError) {
          throw questionsError;
        }

        toast({
          title: 'Thành công!',
          description: `Đã tạo passage và ${questionsToSave.length} câu hỏi Part 6 vào hệ thống.`
        });

        // Reset
        setPart6Result(null);
        setGeneratedQuestions([]);
        setSelectedQuestions(new Set());

      } catch {
        toast({
          title: 'Lỗi',
          description: 'Không thể lưu câu hỏi Part 6. Vui lòng thử lại.',
          variant: 'destructive'
        });
      }
      return;
    }

    // Special handling for Part 7
    if (formData.part === 7 && part7Result) {
      try {
        // Create passages first
        const passageDataArray = [];
        for (const passage of part7Result.passages) {
          const { data: passageData, error: passageError } = await supabase
            .from('passages')
            .insert({
              part: 7,
              passage_type: 'single',
              texts: {
                content: passage.content,
                type: passage.type,
                title: passage.title
              },
              created_by: user.id
            })
            .select()
            .single();

          if (passageError) {
            throw passageError;
          }
          passageDataArray.push(passageData);
        }

        // Then create questions with passage_id
        const questionsToSave = part7Result.questions.map((q) => ({
          part: 7,
          passage_id: passageDataArray[0].id,
          prompt_text: q.question,
          choices: q.choices,
          correct_choice: q.answer,
          explain_vi: q.explain_vi,
          explain_en: q.explain_en,
          difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
          status: 'published',
          created_by: user.id,
          tags: q.tags,
          audio_url: null,
          transcript: null,
          image_url: null
        }));

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToSave);

        if (questionsError) {
          throw questionsError;
        }

        toast({
          title: 'Thành công!',
          description: `Đã tạo ${passageDataArray.length} passage và ${questionsToSave.length} câu hỏi Part 7 vào hệ thống.`
        });

        // Reset
        setPart7Result(null);
        setGeneratedQuestions([]);
        setSelectedQuestions(new Set());

      } catch {
        toast({
          title: 'Lỗi',
          description: 'Không thể lưu câu hỏi Part 7. Vui lòng thử lại.',
          variant: 'destructive'
        });
      }
      return;
    }

    try {
      const questionsToSave = generatedQuestions.map(q => ({
        part: formData.part,
        prompt_text: q.question,
        choices: q.choices,
        correct_choice: q.answer,
        explain_vi: q.explain_vi,
        explain_en: q.explain_en,
        difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
        status: 'published',
        created_by: user.id,
        tags: q.tags,
        audio_url: null,
        transcript: null,
        image_url: null,
        passage_id: null,
        blank_index: null
      }));

      const { error: insertError } = await supabase
        .from('questions')
        .insert(questionsToSave);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Thành công!',
        description: `Đã lưu ${questionsToSave.length} câu hỏi vào hệ thống.`
      });

      // Notify parent component
      if (onQuestionsGenerated) {
        onQuestionsGenerated(questionsToSave as unknown as Question[]);
      }

      // Reset form
      setGeneratedQuestions([]);
      setSelectedQuestions(new Set());
      setFormData({
        content: '',
        type: 'mix',
        difficulty: 'medium',
        questionCount: 5,
        language: 'vi',
        part: 5
      });

    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSelectedQuestions = async () => {
    if (!user || selectedQuestions.size === 0) return;

    try {
      const selectedQuestionsData = Array.from(selectedQuestions).map(index => generatedQuestions[index]);
      
      const questionsToSave = selectedQuestionsData.map(q => ({
        part: formData.part,
        prompt_text: q.question,
        choices: q.choices,
        correct_choice: q.answer,
        explain_vi: q.explain_vi,
        explain_en: q.explain_en,
        difficulty: formData.difficulty === 'mix' ? 'medium' : formData.difficulty,
        status: 'published',
        created_by: user.id,
        tags: q.tags,
        audio_url: null,
        transcript: null,
        image_url: null,
        passage_id: null,
        blank_index: null
      }));

      const { error: insertError } = await supabase
        .from('questions')
        .insert(questionsToSave);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Thành công!',
        description: `Đã lưu ${questionsToSave.length} câu hỏi đã chọn vào hệ thống.`
      });

      // Notify parent component
      if (onQuestionsGenerated) {
        onQuestionsGenerated(questionsToSave as unknown as Question[]);
      }

      // Remove saved questions from the list
      const remainingQuestions = generatedQuestions.filter((_, index) => !selectedQuestions.has(index));
      setGeneratedQuestions(remainingQuestions);
      setSelectedQuestions(new Set());

    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi đã chọn. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  };

  const handleCopyQuestion = (question: GeneratedQuestion) => {
    const text = `Câu hỏi: ${question.question}\n\nLựa chọn:\nA. ${question.choices[0]}\nB. ${question.choices[1]}\nC. ${question.choices[2]}\nD. ${question.choices[3]}\n\nĐáp án: ${question.answer}\n\nGiải thích (VI): ${question.explain_vi}\nGiải thích (EN): ${question.explain_en}`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Đã sao chép',
        description: 'Câu hỏi đã được sao chép vào clipboard.'
      });
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return {
    // States
    user,
    activeTab,
    setActiveTab,
    loading,
    progress,
    generatedQuestions,
    selectedQuestions,
    error,
    formData,
    setFormData,
    file,
    url,
    setUrl,
    showPromptGuide,
    setShowPromptGuide,
    part6Result,
    part7Result,
    showTemplate,
    setShowTemplate,
    passageCount,
    setPassageCount,
    apiKey,
    setApiKey,
    aiProvider,
    setAiProvider,
    ollamaStatus,
    ollamaModel,
    setOllamaModel,
    availableModels,
    // Handlers
    checkOllamaConnection,
    saveApiKey,
    toggleQuestionSelection,
    selectAllQuestions,
    deselectAllQuestions,
    handleGenerate,
    handleSaveQuestions,
    handleSaveSelectedQuestions,
    handleCopyQuestion,
    handleFileChange
  };
};
