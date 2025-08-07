import React, { useCallback, useState } from 'react';
import { Upload, Paperclip, FileText, Image, X } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
  description: string;
  icon?: 'upload' | 'paperclip';
  selectedFile?: File | null;
  onRemoveFile?: () => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept,
  label,
  description,
  icon = 'upload',
  selectedFile,
  onRemoveFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
    e.target.value = '';
  }, [onFileSelect]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    return <FileText className="w-6 h-6 text-green-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          {getFileIcon(selectedFile)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" data-testid="selected-file-name">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500" data-testid="selected-file-size">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {onRemoveFile && (
            <button 
              className="text-gray-400 hover:text-red-500 transition-colors"
              onClick={onRemoveFile}
              data-testid="button-remove-file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>
      <div
        className={`file-dropzone rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver ? 'active' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-input-${icon}`)?.click()}
        data-testid={`dropzone-${icon}`}
      >
        <input
          id={`file-input-${icon}`}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileInput}
          data-testid={`input-file-${icon}`}
        />
        <div className="flex flex-col items-center justify-center min-h-[120px]">
          {icon === 'upload' ? (
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
          ) : (
            <Paperclip className="w-12 h-12 text-gray-400 mb-4" />
          )}
          <p className="text-gray-600 font-medium mb-2">
            Drag & drop your file here, or{' '}
            <span className="text-green-600 hover:text-green-700">click to browse</span>
          </p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};
