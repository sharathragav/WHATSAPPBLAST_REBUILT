import React, { useEffect, useRef } from 'react';
import { Activity, Users, CheckCircle, XCircle, Info, Clock, List, X } from 'lucide-react';

interface LogEntry {
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: string;
}

interface ProgressLogProps {
  isActive: boolean;
  current: number;
  total: number;
  successCount: number;
  failureCount: number;
  logs: string[];
  onClose?: () => void;
}

export const ProgressLog: React.FC<ProgressLogProps> = ({
  isActive,
  current,
  total,
  successCount,
  failureCount,
  logs,
  onClose
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const progressPercentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const parseLogEntry = (log: string): LogEntry => {
    const timestamp = new Date().toLocaleTimeString();
    
    if (log.includes('✓') || log.includes('successfully') || log.includes('Success')) {
      return { message: log, type: 'success', timestamp };
    } else if (log.includes('✗') || log.includes('Failed') || log.includes('Error')) {
      return { message: log, type: 'error', timestamp };
    } else {
      return { message: log, type: 'info', timestamp };
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />;
      default:
        return <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />;
    }
  };

  const getLogClasses = (type: string) => {
    const baseClasses = "flex items-start space-x-3 text-sm p-4 rounded-lg border-l-4";
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 text-green-800 border-green-400`;
      case 'error':
        return `${baseClasses} bg-red-50 text-red-800 border-red-400`;
      default:
        return `${baseClasses} bg-blue-50 text-blue-800 border-blue-400`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm" data-testid="progress-log">
      {/* Progress Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Activity className={`w-6 h-6 text-green-600 ${isActive ? 'animate-pulse' : ''}`} />
            <h3 className="text-xl font-semibold text-gray-900" data-testid="text-status">
              {isActive ? 'Sending in Progress...' : 'Process Complete'}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`} data-testid="status-badge">
            {isActive ? 'Active' : 'Completed'}
          </div>
        </div>
        {onClose && (
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            onClick={onClose}
            data-testid="button-close-progress"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Bar Section */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700" data-testid="text-progress">
              Progress: <span data-testid="progress-current">{current}</span> / <span data-testid="progress-total">{total}</span> contacts
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900" data-testid="progress-percentage">{progressPercentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="progress-bar-animated relative bg-gradient-to-r from-green-600 to-green-800 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
            data-testid="progress-bar"
          />
        </div>

        {/* Statistics Row */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span data-testid="stats-success">{successCount}</span> successful
            </div>
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span data-testid="stats-failed">{failureCount}</span> failed
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <Info className="w-4 h-4" />
              <span data-testid="stats-info">{logs.length}</span> logs
            </div>
          </div>
          {isActive && (
            <div className="text-gray-500 animate-pulse" data-testid="text-processing">
              Processing...
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <List className="w-5 h-5 mr-2 text-green-600" />
            Activity Log (<span data-testid="log-count">{logs.length}</span> entries)
          </h4>
          <span className="text-sm text-gray-500">Live updates</span>
        </div>
        
        {/* Scrollable Log Container */}
        <div 
          ref={logContainerRef}
          className="max-h-80 overflow-y-auto space-y-3 custom-scrollbar" 
          data-testid="log-container"
        >
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="text-no-logs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No activity logs yet. Start sending messages to see real-time updates.</p>
            </div>
          ) : (
            logs.map((log, index) => {
              const logEntry = parseLogEntry(log);
              return (
                <div key={index} className={getLogClasses(logEntry.type)} data-testid={`log-entry-${index}`}>
                  {getLogIcon(logEntry.type)}
                  <div className="flex-1">
                    <p className="font-medium">{logEntry.message}</p>
                    <p className={`text-xs mt-1 ${
                      logEntry.type === 'success' ? 'text-green-600' :
                      logEntry.type === 'error' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {logEntry.timestamp}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Loading Indicator */}
        {isActive && (
          <div className="mt-6 flex items-center justify-center text-sm text-gray-600" data-testid="loading-indicator">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Sending messages... Please keep this tab open</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
