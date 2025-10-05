import { supabase } from '@/integrations/supabase/client';
import { AudioProcessor, TOEIC_AUDIO_RULES } from '@/utils/audioProcessor';

export interface AudioUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    size: number;
    duration: number;
    format: string;
  };
}

export interface AudioFileInfo {
  id: string;
  name: string;
  url: string;
  size: number;
  duration: number;
  format: string;
  uploadedAt: string;
  userId: string;
}

export class AudioStorageService {
  private static readonly BUCKET_NAME = 'toeic-audio';
  private static readonly MAX_FILE_SIZE = TOEIC_AUDIO_RULES.MAX_FILE_SIZE;

  /**
   * Upload audio file to Supabase Storage
   */
  static async uploadAudio(
    file: File,
    userId: string,
    folder?: string
  ): Promise<AudioUploadResult> {
    try {
      // Validate file
      const validation = await AudioProcessor.validateAudioFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop() || 'mp3';
      const uniqueFileName = await this.generateUniqueFileName(userId, fileExtension);
      
      // Create file path
      const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        metadata: {
          size: file.size,
          duration: validation.metadata.duration,
          format: file.type
        }
      };

    } catch (error) {
      console.error('Audio upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Upload multiple audio files
   */
  static async uploadMultipleAudio(
    files: File[],
    userId: string,
    folder?: string
  ): Promise<AudioUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadAudio(file, userId, folder)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Get audio file info
   */
  static async getAudioInfo(filePath: string): Promise<AudioFileInfo | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop()
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      const file = data[0];
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        id: file.id,
        name: file.name,
        url: urlData.publicUrl,
        size: file.metadata?.size || 0,
        duration: 0, // Would need to be stored separately
        format: file.metadata?.mimetype || 'audio/mp3',
        uploadedAt: file.created_at,
        userId: filePath.split('/')[0] // Assuming first part is userId
      };

    } catch (error) {
      console.error('Get audio info error:', error);
      return null;
    }
  }

  /**
   * List audio files for a user
   */
  static async listUserAudioFiles(
    userId: string,
    folder?: string
  ): Promise<AudioFileInfo[]> {
    try {
      const path = folder ? `${userId}/${folder}` : userId;
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path);

      if (error) {
        console.error('List files error:', error);
        return [];
      }

      if (!data) return [];

      const fileInfos: AudioFileInfo[] = [];

      for (const file of data) {
        const filePath = `${path}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(filePath);

        fileInfos.push({
          id: file.id,
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          duration: 0, // Would need to be stored separately
          format: file.metadata?.mimetype || 'audio/mp3',
          uploadedAt: file.created_at,
          userId
        });
      }

      return fileInfos;

    } catch (error) {
      console.error('List user audio files error:', error);
      return [];
    }
  }

  /**
   * Delete audio file
   */
  static async deleteAudio(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete audio error:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Delete audio error:', error);
      return false;
    }
  }

  /**
   * Generate unique filename
   */
  private static async generateUniqueFileName(
    userId: string,
    extension: string
  ): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${userId}_${timestamp}_${random}.${extension}`;
  }

  /**
   * Get audio file URL
   */
  static getAudioUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Download audio file
   */
  static async downloadAudio(filePath: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (error) {
        console.error('Download audio error:', error);
        return null;
      }

      return data;

    } catch (error) {
      console.error('Download audio error:', error);
      return null;
    }
  }

  /**
   * Get storage usage for a user
   */
  static async getUserStorageUsage(userId: string): Promise<{
    totalSize: number;
    fileCount: number;
    files: AudioFileInfo[];
  }> {
    try {
      const files = await this.listUserAudioFiles(userId);
      
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const fileCount = files.length;

      return {
        totalSize,
        fileCount,
        files
      };

    } catch (error) {
      console.error('Get user storage usage error:', error);
      return {
        totalSize: 0,
        fileCount: 0,
        files: []
      };
    }
  }

  /**
   * Clean up old files (admin function)
   */
  static async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      // This would typically be called from a server-side function
      // For now, we'll return a mock value
      console.log(`Cleaning up files older than ${daysOld} days`);
      return 0;

    } catch (error) {
      console.error('Cleanup old files error:', error);
      return 0;
    }
  }
}
