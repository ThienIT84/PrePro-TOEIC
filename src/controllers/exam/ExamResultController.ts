/**
 * ExamResultController
 * Business logic cho màn hình xem kết quả thi TOEIC
 * Extracted từ ExamResult.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface QuestionResult {
  question_id: string;
  question_text: string;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  time_spent: number;
  explain_vi: string;
  explain_en: string;
  tags: string;
  transcript: string;
  part: number;
  choices?: { A: string; B: string; C: string; D: string } | null;
  audio_url?: string | null;
  image_url?: string | null;
  passage_id?: string | null;
  passage_audio_url?: string | null;
  passage_image_url?: string | null;
  passage_transcript?: string | null;
  passage_translation_vi?: {
    content: string;
  } | null;
  passage_translation_en?: {
    content: string;
  } | null;
}

export interface ExamResultData {
  session_id: string;
  exam_set_name: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent: number;
  completed_at: string;
  questions: QuestionResult[];
  results?: unknown;
}

export interface ExamResultState {
  result: ExamResultData | null;
  loading: boolean;
  error: string | null;
  retryMode: boolean;
  questions: any[];
  attempts: any[];
}

export class ExamResultController {
  private state: ExamResultState;
  private listeners: Array<(state: ExamResultState) => void> = [];

  constructor() {
    this.state = {
      result: null,
      loading: true,
      error: null,
      retryMode: false,
      questions: [],
      attempts: []
    };
  }

  subscribe(listener: (state: ExamResultState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.getState()));
  }

  getState(): ExamResultState {
    return { ...this.state };
  }

  setRetryMode(enabled: boolean): void {
    this.state.retryMode = enabled;
    this.notify();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  async fetchExamResult(sessionId: string): Promise<void> {
    try {
      this.state.loading = true;
      this.state.error = null;
      this.notify();

      // RPC call first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_exam_result', {
        session_uuid: sessionId
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        const rpcResult = rpcData[0] as any;
        const transformedResult: ExamResultData = {
          ...rpcResult,
          questions: rpcResult.attempts_data || []
        };
        this.state.result = transformedResult;

        if (rpcResult.attempts_data && Array.isArray(rpcResult.attempts_data)) {
          const questionIds = rpcResult.attempts_data.map((attempt: any) => attempt.question_id);
          const { data: fullQuestions } = await supabase
            .from('questions')
            .select('*')
            .in('id', questionIds);

          const validQuestions = (fullQuestions || []).map(question => {
            const attempt = rpcResult.attempts_data.find((a: any) => a.question_id === question.id);
            return {
              ...question,
              user_answer: attempt?.user_answer || '',
              is_correct: attempt?.is_correct || false,
              time_spent: attempt?.time_spent || 0
            };
          });

          this.state.questions = validQuestions;
          this.state.attempts = rpcResult.attempts_data;
        }
        this.state.loading = false;
        this.notify();
        return;
      }

      // Fallback direct queries
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          total_questions,
          correct_answers,
          score,
          time_spent,
          completed_at,
          results,
          exam_sets (title, description)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        this.state.error = `Không thể tải kết quả thi: ${sessionError.message}`;
        this.state.loading = false;
        this.notify();
        return;
      }

      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('question_id, user_answer, is_correct, time_spent')
        .eq('session_id', sessionId);

      if (attemptsError) {
        this.state.error = `Không thể tải chi tiết câu trả lời: ${attemptsError.message}`;
        this.state.loading = false;
        this.notify();
        return;
      }

      const passageMap: Record<string, any> = {};
      const qids = (attemptsData || []).map(a => a.question_id);
      const served = (sessionData as any)?.results?.served_question_ids as string[] | undefined;
      const allIds = served ? Array.from(new Set([...served, ...qids])) : qids;

      const { data: qs } = await supabase
        .from('questions')
        .select('id, prompt_text, choices, correct_choice, explain_vi, explain_en, tags, transcript, audio_url, image_url, passage_id')
        .in('id', allIds);

      const map: Record<string, any> = {};
      (qs || []).forEach(q => { map[q.id] = q; });
      (attemptsData || []).forEach(a => { (a as any).question_detail = map[a.question_id]; });

      const passageIds = [...new Set((qs || []).map(q => q.passage_id).filter(Boolean))];
      if (passageIds.length > 0) {
        const { data: passages } = await supabase
          .from('passages')
          .select('id, audio_url, image_url, texts, translation_vi, translation_en')
          .in('id', passageIds);

        if (passages) {
          passages.forEach((p: any) => {
            passageMap[p.id] = {
              audio_url: p.audio_url,
              image_url: p.image_url,
              texts: p.texts,
              translation_vi: p.translation_vi,
              translation_en: p.translation_en
            };
          });
        }
      }

      if (served && served.length > 0) {
        const answeredSet = new Set(qids);
        const missing = served.filter(id => !answeredSet.has(id));
        missing.forEach(id => {
          (attemptsData || []).push({
            question_id: id,
            user_answer: '',
            is_correct: false,
            time_spent: 0,
            question_detail: map[id]
          } as any);
        });
      }

      const transformedResult: ExamResultData = {
        session_id: (sessionData as any).id,
        exam_set_name: (sessionData as any).exam_sets?.title || 'Bài thi',
        total_questions: (sessionData as any).total_questions,
        correct_answers: (sessionData as any).correct_answers,
        score: (sessionData as any).score,
        time_spent: (sessionData as any).time_spent,
        completed_at: (sessionData as any).completed_at,
        questions: (attemptsData || []).map(attempt => {
          const questionDetail = (attempt as any).question_detail;
          const passageId = questionDetail?.passage_id;
          const passageData = passageId ? passageMap[passageId] : null;

          return {
            question_id: attempt.question_id,
            question_text: questionDetail?.prompt_text || '',
            correct_answer: questionDetail?.correct_choice || '',
            user_answer: attempt.user_answer || '',
            is_correct: attempt.is_correct,
            time_spent: attempt.time_spent,
            explain_vi: questionDetail?.explain_vi || '',
            explain_en: questionDetail?.explain_en || '',
            tags: questionDetail?.tags ? String(questionDetail.tags) : '',
            transcript: questionDetail?.transcript || '',
            part: questionDetail?.part || 1,
            choices: questionDetail?.choices || null,
            audio_url: questionDetail?.audio_url || null,
            image_url: questionDetail?.image_url || null,
            passage_id: passageId || null,
            passage_audio_url: passageData?.audio_url || null,
            passage_image_url: passageData?.image_url || null,
            passage_transcript: passageData?.texts?.content || null,
            passage_translation_vi: passageData?.translation_vi || null,
            passage_translation_en: passageData?.translation_en || null
          };
        })
      };

      const { data: fullQuestions } = await supabase
        .from('questions')
        .select('*')
        .in('id', qids);

      const validQuestions = (fullQuestions || []).map(question => {
        const attempt = (attemptsData || []).find(a => a.question_id === question.id);
        return {
          ...question,
          user_answer: attempt?.user_answer || '',
          is_correct: attempt?.is_correct || false,
          time_spent: attempt?.time_spent || 0
        };
      });

      this.state.result = transformedResult;
      this.state.questions = validQuestions;
      this.state.attempts = attemptsData || [];
      this.state.loading = false;
      this.notify();
    } catch (error) {
      console.error('Error fetching exam result:', error);
      this.state.error = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải kết quả thi';
      this.state.loading = false;
      this.notify();
    }
  }

  cleanup(): void {
    this.listeners = [];
  }
}
