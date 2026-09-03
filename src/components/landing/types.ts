export interface InteractiveQuestion {
  id: string;
  part: number;
  promptText: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctChoice: 'A' | 'B' | 'C' | 'D';
  explainVi: string;
  explainEn: string;
  grammarTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MetricStat {
  value: string;
  label: string;
  description: string;
  iconName: string;
}

export interface ToeicPartInfo {
  part: number;
  name: string;
  englishName: string;
  type: 'listening' | 'reading';
  questionCount: number;
  duration: string;
  description: string;
  tips: string[];
  badgeColor: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  bullets: string[];
  badge: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'student' | 'teacher';
}

export interface ListeningAccentSample {
  id: string;
  country: 'US' | 'UK' | 'AU' | 'CA';
  countryName: string;
  flag: string;
  accentTitle: string;
  description: string;
  sampleAudioPrompt: string;
  speakerText: string;
  translationVi: string;
  keyPhonetics: string;
}

