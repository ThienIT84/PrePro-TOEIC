/**
 * Audio utility functions for TOEIC questions
 * Handles audio URL logic based on question part
 */

export interface QuestionWithPassage {
  id: string;
  part: number;
  audio_url?: string;
  passage?: {
    id: string;
    audio_url?: string;
  };
}

/**
 * Get the correct audio URL for a question based on its part
 * @param question - Question object with optional passage
 * @returns Audio URL or null
 */
export function getQuestionAudioUrl(question: QuestionWithPassage): string | null {
  const { part, audio_url, passage } = question;

  switch (part) {
    case 1: // Photos - each question has its own audio
    case 2: // Question-Response - each question has its own audio
      return audio_url || null;

    case 3: // Conversations - audio belongs to passage
    case 4: // Talks - audio belongs to passage
      return passage?.audio_url || null;

    case 5: // Incomplete Sentences - no audio
    case 6: // Text Completion - no audio
    case 7: // Reading Comprehension - no audio
    default:
      return null;
  }
}

/**
 * Check if a question part requires audio
 * @param part - TOEIC part number (1-7)
 * @returns true if part requires audio
 */
export function isAudioRequired(part: number): boolean {
  return [1, 2, 3, 4].includes(part);
}

/**
 * Check if a question part uses passage audio
 * @param part - TOEIC part number (1-7)
 * @returns true if part uses passage audio
 */
export function usesPassageAudio(part: number): boolean {
  return [3, 4].includes(part);
}

/**
 * Check if a question part uses individual audio
 * @param part - TOEIC part number (1-7)
 * @returns true if part uses individual audio
 */
export function usesIndividualAudio(part: number): boolean {
  return [1, 2].includes(part);
}

/**
 * Get audio source description for UI
 * @param question - Question object with optional passage
 * @returns Description of audio source
 */
export function getAudioSourceDescription(question: QuestionWithPassage): string {
  const { part } = question;

  switch (part) {
    case 1:
      return 'Audio riêng cho câu hỏi';
    case 2:
      return 'Audio riêng cho câu hỏi';
    case 3:
      return 'Audio chung cho đoạn hội thoại';
    case 4:
      return 'Audio chung cho bài nói';
    case 5:
    case 6:
    case 7:
    default:
      return 'Không có audio';
  }
}
