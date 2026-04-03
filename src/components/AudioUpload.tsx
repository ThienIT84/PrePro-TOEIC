import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileAudio, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  Download,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration?: number;
  url?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface AudioUploadProps {
  onUploadComplete?: (files: AudioFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  acceptedFormats = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  className = ''
}) => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file format
    if (!acceptedFormats.includes(file.type)) {
      return `File format must be one of: ${acceptedFormats.join(', ')}`;
    }

    return null;
  }, [maxSize, acceptedFormats]);

  // Get audio duration
  const getAudioDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => {
        resolve(0);
      };
      audio.src = URL.createObjectURL(file);
    });
  }, []);

  // Handle file selection
  const handleFiles = useCallback(async (selectedFiles: FileList) => {
    const newFiles: AudioFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Validate file
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }

      // Check if we've reached max files
      if (files.length + newFiles.length >= maxFiles) {
        toast({
          title: "Too munknown files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        });
        break;
      }

      // Get audio duration
      const duration = await getAudioDuration(file);

      const audioFile: AudioFile = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        duration,
        status: 'pending',
        progress: 0,
      };

      newFiles.push(audioFile);
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [files.length, maxFiles, validateFile, getAudioDuration]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  // Remove file
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  // Upload file (mock implementation)
  const uploadFile = useCallback(async (file: AudioFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate success
          setTimeout(() => {
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { ...f, status: 'completed', progress: 100, url: `mock-url-${file.id}` }
                : f
            ));
            resolve();
          }, 500);
        } else {
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'uploading', progress }
              : f
          ));
        }
      }, 200);
    });
  }, []);

  // Upload all files
  const uploadAllFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      await Promise.all(pendingFiles.map(uploadFile));
      
      toast({
        title: "Upload successful",
        description: `${pendingFiles.length} files uploaded successfully`,
      });

      onUploadComplete?.(files);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Some files failed to upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadFile, onUploadComplete]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Audio Upload
          </CardTitle>
          <CardDescription>
            Upload audio files for TOEIC listening questions. Max {maxFiles} files, {maxSize}MB each.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag and drop audio files here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= maxFiles}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFormats.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Queue ({files.length}/{maxFiles})</CardTitle>
              <Button 
                onClick={uploadAllFiles}
                disabled={isUploading || files.every(f => f.status !== 'pending')}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <FileAudio className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{file.name}</p>
                    {file.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    {file.duration && file.duration > 0 && (
                      <span>{formatDuration(file.duration)}</span>
                    )}
                    <span className="capitalize">{file.status}</span>
                  </div>

                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-2" />
                  )}

                  {file.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{file.error}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={file.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioUpload;
