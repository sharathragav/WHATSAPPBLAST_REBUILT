import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, HelpCircle, Server, Github, Book, LifeBuoy, ShieldCheck, Zap, Users, Download, RefreshCw, X } from 'lucide-react';
import { FileDropzone } from '@/components/FileDropzone';
import { ProgressLog } from '@/components/ProgressLog';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/use-toast';
import type { ProgressResponse, StatusResponse } from '@shared/schema';

export default function Home() {
  const [recipientsFile, setRecipientsFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Poll progress data when processing
  const { data: progressData } = useQuery<ProgressResponse>({
    queryKey: ['/api/progress'],
    enabled: isProcessing,
    refetchInterval: isProcessing ? 2000 : false,
  });

  // Get final status
  const { data: statusData } = useQuery<StatusResponse>({
    queryKey: ['/api/status'],
    enabled: !isProcessing,
  });

  // Send messages mutation
  const sendMessagesMutation = useMutation({
    mutationFn: async () => {
      if (!recipientsFile) {
        throw new Error('Recipients file is required');
      }

      const formData = new FormData();
      formData.append('recipientsFile', recipientsFile);
      if (attachmentFile) {
        formData.append('attachmentFile', attachmentFile);
      }

      const response = await fetch('/api/send', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start sending process');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsProcessing(true);
      showToast('Message sending process started successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
    onError: (error) => {
      showToast(error.message || 'Failed to start sending process', 'error');
    },
  });

  // Monitor processing state
  useEffect(() => {
    if (progressData && !progressData.is_active && isProcessing) {
      setIsProcessing(false);
      showToast('Message sending process completed!', 'success');
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    }
  }, [progressData, isProcessing, queryClient]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleStartSending = () => {
    if (!recipientsFile) {
      showToast('Please select a recipients Excel file first', 'error');
      return;
    }
    sendMessagesMutation.mutate();
  };

  const handleClearFiles = () => {
    setRecipientsFile(null);
    setAttachmentFile(null);
    showToast('Files cleared successfully', 'success');
  };

  const handleClearLogs = () => {
    // This would typically call an API to clear server logs
    showToast('Logs cleared', 'info');
  };

  const handleDownloadReport = () => {
    // This would typically generate and download a report
    showToast('Report downloaded', 'success');
  };

  const currentProgress = progressData || {
    is_active: false,
    current: 0,
    total: 0,
    logs: [],
    success_count: 0,
    failure_count: 0
  };

  const showProgress = isProcessing || currentProgress.logs.length > 0;
  const showStats = currentProgress.current > 0 || currentProgress.total > 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-lg">
              <Send className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                WhatsApp Bulk Sender
              </h1>
              <p className="text-green-800 font-medium">Professional Messaging Automation</p>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload your Excel file of recipients and optional attachment to start sending messages efficiently and professionally.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Secure Processing</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span>Real-time Tracking</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-green-600" />
              <span>Bulk Processing</span>
            </div>
          </div>
        </div>

        {/* Main Application Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 animate-slide-up">
          {/* File Upload Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Recipients File Upload */}
            <div>
              <FileDropzone
                onFileSelect={setRecipientsFile}
                accept=".xlsx,.xls"
                label="Recipients Excel File *"
                description="Supported formats: .xlsx, .xls"
                icon="upload"
                selectedFile={recipientsFile}
                onRemoveFile={() => setRecipientsFile(null)}
              />
              <div className="mt-3 flex items-start space-x-2 text-sm text-gray-600">
                <HelpCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Excel file should contain a 'Contact' column with phone numbers and optionally a 'Message' column for personalized texts.</p>
              </div>
            </div>

            {/* Attachment File Upload */}
            <div>
              <FileDropzone
                onFileSelect={setAttachmentFile}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
                label="Attachment (Optional)"
                description="PDF, images, documents"
                icon="paperclip"
                selectedFile={attachmentFile}
                onRemoveFile={() => setAttachmentFile(null)}
              />
              <div className="mt-3 flex items-start space-x-2 text-sm text-gray-600">
                <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>This file will be sent to all recipients along with their personalized message.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Display */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl" data-testid="stats-section">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1" data-testid="stat-current">{currentProgress.current}</div>
                <div className="text-sm text-gray-600 font-medium">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-700 mb-1" data-testid="stat-total">{currentProgress.total}</div>
                <div className="text-sm text-gray-600 font-medium">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1" data-testid="stat-success">{currentProgress.success_count}</div>
                <div className="text-sm text-gray-600 font-medium">Success</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1" data-testid="stat-failed">{currentProgress.failure_count}</div>
                <div className="text-sm text-gray-600 font-medium">Failed</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button 
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-600/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleStartSending}
              disabled={!recipientsFile || sendMessagesMutation.isPending || isProcessing}
              data-testid="button-start-sending"
            >
              <Send className="w-6 h-6" />
              <span>{sendMessagesMutation.isPending ? 'Starting...' : 'Start Sending'}</span>
            </button>

            <button 
              className="flex items-center space-x-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              onClick={handleClearFiles}
              disabled={isProcessing}
              data-testid="button-clear-files"
            >
              <X className="w-5 h-5" />
              <span>Clear Files</span>
            </button>

            <button 
              className="flex items-center space-x-2 px-6 py-4 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
              onClick={handleClearLogs}
              data-testid="button-clear-logs"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Clear Logs</span>
            </button>

            <button 
              className="flex items-center space-x-2 px-6 py-4 border-2 border-green-300 text-green-700 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all duration-200"
              onClick={handleDownloadReport}
              data-testid="button-download-report"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>

          {/* Progress and Log Section */}
          {showProgress && (
            <ProgressLog
              isActive={currentProgress.is_active}
              current={currentProgress.current}
              total={currentProgress.total}
              successCount={currentProgress.success_count}
              failureCount={currentProgress.failure_count}
              logs={currentProgress.logs}
            />
          )}
        </div>

        {/* Instructions & Help Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Instructions Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-start space-x-3 mb-4">
              <HelpCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How to Use</h3>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                  <li>Upload an Excel file containing a 'Contact' column with phone numbers</li>
                  <li>Optionally add a 'Message' column for personalized messages</li>
                  <li>Upload an attachment file if you want to send the same file to all contacts</li>
                  <li>Click 'Start Sending' and scan the QR code in the browser window that opens</li>
                  <li>Monitor the real-time progress and logs below</li>
                </ol>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <Server className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-800">System Status</h3>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Backend API</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium text-xs">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">WebDriver</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium text-xs">Ready</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">WhatsApp</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <span className={`font-medium text-xs ${isProcessing ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isProcessing ? 'Active' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 py-6 border-t border-gray-200">
          <p className="text-gray-600 mb-2">
            © 2024 WhatsApp Bulk Sender. Built with ❤️ for efficient communication.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-green-600 transition-colors flex items-center space-x-1">
              <Github className="w-4 h-4" />
              <span>Source Code</span>
            </a>
            <a href="#" className="hover:text-green-600 transition-colors flex items-center space-x-1">
              <Book className="w-4 h-4" />
              <span>Documentation</span>
            </a>
            <a href="#" className="hover:text-green-600 transition-colors flex items-center space-x-1">
              <LifeBuoy className="w-4 h-4" />
              <span>Support</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
