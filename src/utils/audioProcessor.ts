// Audio processing utilities for TOEIC system

export interface AudioValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    duration: number;
    size: number;
    format: string;
    bitrate?: number;
    sampleRate?: number;
  };
}

export interface AudioCompressionOptions {
  quality: 'low' | 'medium' | 'high';
  maxSize: number; // in MB
  targetBitrate?: number;
}

export class AudioProcessor {
  /**
   * Validate audio file
   */
  static async validateAudioFile(file: File): Promise<AudioValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic file validation
    if (!file.type.startsWith('audio/')) {
      errors.push('File is not an audio file');
    }

    // Size validation
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (50MB)`);
    }

    // Get audio metadata
    const metadata = await this.getAudioMetadata(file);
    
    // Duration validation
    if (metadata.duration > 300) { // 5 minutes
      warnings.push('Audio duration is longer than 5 minutes, which may not be suitable for TOEIC');
    }

    if (metadata.duration < 5) { // 5 seconds
      warnings.push('Audio duration is very short, please ensure it contains sufficient content');
    }

    // Format validation
    const supportedFormats = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/aac'];
    if (!supportedFormats.includes(file.type)) {
      errors.push(`Unsupported audio format: ${file.type}. Supported formats: ${supportedFormats.join(', ')}`);
    }

    // Quality validation
    if (metadata.sampleRate && metadata.sampleRate < 22050) {
      warnings.push('Audio sample rate is below 22kHz, which may affect quality');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  /**
   * Get audio metadata
   */
  static async getAudioMetadata(file: File): Promise<AudioValidationResult['metadata']> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: audio.duration,
          size: file.size,
          format: file.type,
          bitrate: this.calculateBitrate(file.size, audio.duration),
          sampleRate: this.getSampleRate(audio)
        });
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: 0,
          size: file.size,
          format: file.type
        });
      };

      audio.src = url;
    });
  }

  /**
   * Calculate bitrate
   */
  static calculateBitrate(fileSizeBytes: number, durationSeconds: number): number {
    if (durationSeconds === 0) return 0;
    return Math.round((fileSizeBytes * 8) / durationSeconds / 1000); // kbps
  }

  /**
   * Get sample rate (mock implementation)
   */
  static getSampleRate(audio: HTMLAudioElement): number {
    // This is a mock implementation
    // In a real application, you'd need Web Audio API or a library like music-metadata
    return 44100; // Default sample rate
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Compress audio file (mock implementation)
   */
  static async compressAudio(
    file: File, 
    options: AudioCompressionOptions
  ): Promise<File> {
    // This is a mock implementation
    // In a real application, you'd use Web Audio API or a library like lamejs
    
    return new Promise((resolve) => {
      // Simulate compression delay
      setTimeout(() => {
        // Create a new file with compressed data (mock)
        const compressedFile = new File([file], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, 1000);
    });
  }

  /**
   * Generate audio waveform data (mock implementation)
   */
  static async generateWaveform(file: File): Promise<number[]> {
    // This is a mock implementation
    // In a real application, you'd use Web Audio API to analyze the audio
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock waveform data
        const waveform = Array.from({ length: 100 }, () => Math.random());
        resolve(waveform);
      }, 500);
    });
  }

  /**
   * Extract audio segments (mock implementation)
   */
  static async extractSegments(
    file: File, 
    segments: { start: number; end: number }[]
  ): Promise<File[]> {
    // This is a mock implementation
    // In a real application, you'd use Web Audio API to extract segments
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const segmentFiles = segments.map((segment, index) => {
          const segmentFile = new File([file], `segment_${index + 1}.${file.name.split('.').pop()}`, {
            type: file.type,
            lastModified: Date.now()
          });
          return segmentFile;
        });
        resolve(segmentFiles);
      }, 1000);
    });
  }

  /**
   * Normalize audio volume (mock implementation)
   */
  static async normalizeAudio(file: File): Promise<File> {
    // This is a mock implementation
    // In a real application, you'd use Web Audio API to normalize volume
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedFile = new File([file], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(normalizedFile);
      }, 800);
    });
  }

  /**
   * Convert audio format (mock implementation)
   */
  static async convertFormat(
    file: File, 
    targetFormat: string
  ): Promise<File> {
    // This is a mock implementation
    // In a real application, you'd use Web Audio API or FFmpeg.js
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const convertedFile = new File([file], file.name.replace(/\.[^/.]+$/, `.${targetFormat.split('/')[1]}`), {
          type: targetFormat,
          lastModified: Date.now()
        });
        resolve(convertedFile);
      }, 1500);
    });
  }
}

/**
 * Audio quality presets for TOEIC
 */
export const TOEIC_AUDIO_PRESETS = {
  LISTENING_PARTS: {
    quality: 'high' as const,
    maxSize: 5, // 5MB
    targetBitrate: 128,
    sampleRate: 44100
  },
  CONVERSATIONS: {
    quality: 'medium' as const,
    maxSize: 10, // 10MB
    targetBitrate: 96,
    sampleRate: 44100
  },
  TALKS: {
    quality: 'medium' as const,
    maxSize: 15, // 15MB
    targetBitrate: 96,
    sampleRate: 44100
  }
} as const;

/**
 * Audio validation rules for TOEIC
 */
export const TOEIC_AUDIO_RULES = {
  MIN_DURATION: 5, // 5 seconds
  MAX_DURATION: 300, // 5 minutes
  MIN_SAMPLE_RATE: 22050,
  RECOMMENDED_SAMPLE_RATE: 44100,
  SUPPORTED_FORMATS: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;
