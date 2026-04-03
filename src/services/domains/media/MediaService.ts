import { BaseService } from '../BaseService';
import type { FileObject } from '@supabase/storage-js';

/**
 * Supabase Storage File Interface (simplified for our use)
 */
interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

/**
 * Supabase Storage Folder Interface
 */
interface StorageFolder {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

/**
 * Type guard to check if object is a file
 */
function isStorageFile(obj: FileObject): boolean {
  return (
    obj.metadata &&
    typeof obj.metadata === 'object' &&
    'size' in obj.metadata
  );
}

/**
 * Type guard to check if object is a folder
 */
function isStorageFolder(obj: FileObject): boolean {
  return (
    obj.metadata &&
    typeof obj.metadata === 'object' &&
    !('size' in obj.metadata)
  );
}

/**
 * Media Service - Xử lý tất cả operations liên quan đến Media
 * Sử dụng BaseService và không thay đổi Supabase
 */
export class MediaService extends BaseService {
  private storageBucket = 'media';

  /**
   * Upload file to storage
   */
  async uploadFile(
    file: File,
    path: string,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<{ data: unknown; error: unknown }> {
    this.log('uploadFile', { path, size: file.size, type: file.type });

    try {
      const { data, error } = await this.supabase.storage
        .from(this.storageBucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false
        });

      if (error) {
        this.handleError(error, 'uploadFile');
      }

      return { data, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get public URL for file
   */
  async getPublicUrl(path: string): Promise<{ data: string | null; error: unknown }> {
    this.log('getPublicUrl', { path });

    try {
      const { data } = this.supabase.storage
        .from(this.storageBucket)
        .getPublicUrl(path);

      return { data: data.publicUrl, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(path: string): Promise<{ error: unknown }> {
    this.log('deleteFile', { path });

    try {
      const { error } = await this.supabase.storage
        .from(this.storageBucket)
        .remove([path]);

      if (error) {
        this.handleError(error, 'deleteFile');
      }

      return { error: null };

    } catch (error) {
      return { error };
    }
  }

  /**
   * List files in folder
   */
  async listFiles(folderPath: string = ''): Promise<{ data: FileObject[] | null; error: unknown }> {
    this.log('listFiles', { folderPath });

    try {
      const { data, error } = await this.supabase.storage
        .from(this.storageBucket)
        .list(folderPath);

      if (error) {
        this.handleError(error, 'listFiles');
      }

      return { data: data || [], error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Upload audio file
   */
  async uploadAudio(
    file: File,
    questionId: string,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<{ data: unknown; error: unknown }> {
    this.log('uploadAudio', { questionId, size: file.size });

    const path = `audio/questions/${questionId}/${Date.now()}-${file.name}`;
    return this.uploadFile(file, path, options);
  }

  /**
   * Upload image file
   */
  async uploadImage(
    file: File,
    questionId: string,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<{ data: unknown; error: unknown }> {
    this.log('uploadImage', { questionId, size: file.size });

    const path = `images/questions/${questionId}/${Date.now()}-${file.name}`;
    return this.uploadFile(file, path, options);
  }

  /**
   * Upload passage assets
   */
  async uploadPassageAsset(
    file: File,
    passageId: string,
    type: 'image' | 'chart',
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<{ data: unknown; error: unknown }> {
    this.log('uploadPassageAsset', { passageId, type, size: file.size });

    const path = `passages/${passageId}/${type}s/${Date.now()}-${file.name}`;
    return this.uploadFile(file, path, options);
  }

  /**
   * Get audio URL for question
   */
  async getQuestionAudioUrl(questionId: string): Promise<{ data: string | null; error: unknown }> {
    this.log('getQuestionAudioUrl', { questionId });

    try {
      // List audio files for this question
      const { data: files, error } = await this.listFiles(`audio/questions/${questionId}`);
      
      if (error) {
        this.handleError(error, 'getQuestionAudioUrl');
      }

      if (!files || files.length === 0) {
        return { data: null, error: null };
      }

      // Filter only files (not folders) and get the most recent audio file
      const audioFiles = files.filter(isStorageFile);
      if (audioFiles.length === 0) {
        return { data: null, error: null };
      }

      const latestFile = audioFiles.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const path = `audio/questions/${questionId}/${latestFile.name}`;
      return this.getPublicUrl(path);

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get image URL for question
   */
  async getQuestionImageUrl(questionId: string): Promise<{ data: string | null; error: unknown }> {
    this.log('getQuestionImageUrl', { questionId });

    try {
      // List image files for this question
      const { data: files, error } = await this.listFiles(`images/questions/${questionId}`);
      
      if (error) {
        this.handleError(error, 'getQuestionImageUrl');
      }

      if (!files || files.length === 0) {
        return { data: null, error: null };
      }

      // Filter only files (not folders) and get the most recent image file
      const imageFiles = files.filter(isStorageFile);
      if (imageFiles.length === 0) {
        return { data: null, error: null };
      }

      const latestFile = imageFiles.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const path = `images/questions/${questionId}/${latestFile.name}`;
      return this.getPublicUrl(path);

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get passage assets URLs
   */
  async getPassageAssetsUrls(passageId: string): Promise<{ 
    data: { images: string[]; charts: string[] } | null; 
    error: unknown 
  }> {
    this.log('getPassageAssetsUrls', { passageId });

    try {
      const [imagesResult, chartsResult] = await Promise.all([
        this.listFiles(`passages/${passageId}/images`),
        this.listFiles(`passages/${passageId}/charts`)
      ]);

      if (imagesResult.error) {
        this.handleError(imagesResult.error, 'getPassageAssetsUrls');
      }

      if (chartsResult.error) {
        this.handleError(chartsResult.error, 'getPassageAssetsUrls');
      }

      const images = (imagesResult.data || [])
        .filter(isStorageFile)
        .map(file => `passages/${passageId}/images/${file.name}`);
      const charts = (chartsResult.data || [])
        .filter(isStorageFile)
        .map(file => `passages/${passageId}/charts/${file.name}`);

      // Get public URLs
      const imageUrls = await Promise.all(
        images.map(path => this.getPublicUrl(path))
      );
      const chartUrls = await Promise.all(
        charts.map(path => this.getPublicUrl(path))
      );

      return {
        data: {
          images: imageUrls.map(result => result.data).filter(Boolean) as string[],
          charts: chartUrls.map(result => result.data).filter(Boolean) as string[]
        },
        error: null
      };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete question media
   */
  async deleteQuestionMedia(questionId: string): Promise<{ error: unknown }> {
    this.log('deleteQuestionMedia', { questionId });

    try {
      const [audioFiles, imageFiles] = await Promise.all([
        this.listFiles(`audio/questions/${questionId}`),
        this.listFiles(`images/questions/${questionId}`)
      ]);

      const filesToDelete: string[] = [];

      // Add audio files to delete list
      if (audioFiles.data) {
        audioFiles.data
          .filter(isStorageFile)
          .forEach(file => {
            filesToDelete.push(`audio/questions/${questionId}/${file.name}`);
          });
      }

      // Add image files to delete list
      if (imageFiles.data) {
        imageFiles.data
          .filter(isStorageFile)
          .forEach(file => {
            filesToDelete.push(`images/questions/${questionId}/${file.name}`);
          });
      }

      if (filesToDelete.length > 0) {
        const { error } = await this.supabase.storage
          .from(this.storageBucket)
          .remove(filesToDelete);

        if (error) {
          this.handleError(error, 'deleteQuestionMedia');
        }
      }

      return { error: null };

    } catch (error) {
      return { error };
    }
  }

  /**
   * Delete passage assets
   */
  async deletePassageAssets(passageId: string): Promise<{ error: unknown }> {
    this.log('deletePassageAssets', { passageId });

    try {
      const [imageFiles, chartFiles] = await Promise.all([
        this.listFiles(`passages/${passageId}/images`),
        this.listFiles(`passages/${passageId}/charts`)
      ]);

      const filesToDelete: string[] = [];

      // Add image files to delete list
      if (imageFiles.data) {
        imageFiles.data
          .filter(isStorageFile)
          .forEach(file => {
            filesToDelete.push(`passages/${passageId}/images/${file.name}`);
          });
      }

      // Add chart files to delete list
      if (chartFiles.data) {
        chartFiles.data
          .filter(isStorageFile)
          .forEach(file => {
            filesToDelete.push(`passages/${passageId}/charts/${file.name}`);
          });
      }

      if (filesToDelete.length > 0) {
        const { error } = await this.supabase.storage
          .from(this.storageBucket)
          .remove(filesToDelete);

        if (error) {
          this.handleError(error, 'deletePassageAssets');
        }
      }

      return { error: null };

    } catch (error) {
      return { error };
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{ data: unknown; error: unknown }> {
    this.log('getStorageStats');

    try {
      const { data: files, error } = await this.listFiles();
      
      if (error) {
        this.handleError(error, 'getStorageStats');
      }

      const stats = {
        totalFiles: files?.length || 0,
        totalSize: 0,
        byType: {
          audio: { count: 0, size: 0 },
          image: { count: 0, size: 0 },
          chart: { count: 0, size: 0 },
          other: { count: 0, size: 0 }
        },
        byFolder: {} as Record<string, { count: number; size: number }>
      };

      // Process files to calculate statistics
      const processFiles = async (files: FileObject[], prefix: string = '') => {
        for (const item of files) {
          if (isStorageFile(item)) {
            // It's a file
            const filePath = prefix ? `${prefix}/${item.name}` : item.name;
            const fileSize = item.metadata?.size || 0;
            
            stats.totalSize += fileSize;

            // Categorize by file type
            const extension = item.name.split('.').pop()?.toLowerCase();
            if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) {
              stats.byType.audio.count++;
              stats.byType.audio.size += fileSize;
            } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
              stats.byType.image.count++;
              stats.byType.image.size += fileSize;
            } else if (['pdf', 'svg'].includes(extension || '')) {
              stats.byType.chart.count++;
              stats.byType.chart.size += fileSize;
            } else {
              stats.byType.other.count++;
              stats.byType.other.size += fileSize;
            }

            // Categorize by folder
            const folder = filePath.split('/')[0];
            if (!stats.byFolder[folder]) {
              stats.byFolder[folder] = { count: 0, size: 0 };
            }
            stats.byFolder[folder].count++;
            stats.byFolder[folder].size += fileSize;
          } else if (isStorageFolder(item)) {
            // It's a folder, recurse
            const folderPath = prefix ? `${prefix}/${item.name}` : item.name;
            const { data: subFiles } = await this.listFiles(folderPath);
            if (subFiles) {
              await processFiles(subFiles, folderPath);
            }
          }
        }
      };

      if (files) {
        await processFiles(files);
      }

      return { data: stats, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Clean up orphaned files
   */
  async cleanupOrphanedFiles(): Promise<{ data: { deleted: number; errors: unknown[] }; error: unknown }> {
    this.log('cleanupOrphanedFiles');

    try {
      const { data: allFiles, error } = await this.listFiles();
      
      if (error) {
        this.handleError(error, 'cleanupOrphanedFiles');
      }

      const filesToDelete: string[] = [];
      const errors: unknown[] = [];

      // Get all question IDs from database
      const { data: questions } = await this.supabase
        .from('questions')
        .select('id');

      const questionIds = new Set(questions?.map(q => q.id) || []);

      // Get all passage IDs from database
      const { data: passages } = await this.supabase
        .from('passages')
        .select('id');

      const passageIds = new Set(passages?.map(p => p.id) || []);

      // Check each file
      const checkFile = async (item: FileObject, prefix: string = '') => {
        if (isStorageFile(item)) {
          const filePath = prefix ? `${prefix}/${item.name}` : item.name;
          
          // Check if it's a question media file
          if (filePath.startsWith('audio/questions/') || filePath.startsWith('images/questions/')) {
            const questionId = filePath.split('/')[2];
            if (!questionIds.has(questionId)) {
              filesToDelete.push(filePath);
            }
          }
          
          // Check if it's a passage asset file
          if (filePath.startsWith('passages/')) {
            const passageId = filePath.split('/')[1];
            if (!passageIds.has(passageId)) {
              filesToDelete.push(filePath);
            }
          }
        } else if (isStorageFolder(item)) {
          // It's a folder, recurse
          const folderPath = prefix ? `${prefix}/${item.name}` : item.name;
          const { data: subFiles } = await this.listFiles(folderPath);
          if (subFiles) {
            for (const subFile of subFiles) {
              await checkFile(subFile, folderPath);
            }
          }
        }
      };

      if (allFiles) {
        for (const file of allFiles) {
          await checkFile(file);
        }
      }

      // Delete orphaned files
      let deletedCount = 0;
      if (filesToDelete.length > 0) {
        const { error: deleteError } = await this.supabase.storage
          .from(this.storageBucket)
          .remove(filesToDelete);

        if (deleteError) {
          errors.push(deleteError);
        } else {
          deletedCount = filesToDelete.length;
        }
      }

      return { 
        data: { deleted: deletedCount, errors }, 
        error: errors.length > 0 ? errors[0] : null 
      };

    } catch (error) {
      return { data: { deleted: 0, errors: [error] }, error };
    }
  }
}
