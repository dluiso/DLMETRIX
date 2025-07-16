import { FC } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  variant?: 'default' | 'analysis' | 'seo' | 'performance' | 'share';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  variant = 'default',
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const baseClasses = cn(
    'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
    sizeClasses[size],
    className
  );

  switch (variant) {
    case 'analysis':
      return (
        <div className="flex items-center justify-center">
          <div className={cn(baseClasses, 'text-blue-600 border-blue-200')}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    
    case 'seo':
      return (
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className={cn(baseClasses, 'text-green-600 border-green-200')}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      );
    
    case 'performance':
      return (
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className={cn(baseClasses, 'text-purple-600 border-purple-200')}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      );
    
    case 'share':
      return (
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className={cn(baseClasses, 'text-indigo-600 border-indigo-200')}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </div>
          </div>
        </div>
      );
    
    default:
      return (
        <div className={cn(baseClasses, 'text-slate-600 border-slate-200')}></div>
      );
  }
};

// Advanced DLMETRIX-branded spinner
export const DLMETRIXSpinner: FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={cn(
          'absolute inset-0 border-2 border-blue-200 rounded-full animate-spin',
          sizeClasses[size]
        )}>
          <div className="absolute top-0 left-0 w-2 h-2 bg-blue-600 rounded-full transform -translate-x-1 -translate-y-1"></div>
        </div>
        
        {/* Inner pulsing core */}
        <div className={cn(
          'flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-full',
          sizeClasses[size]
        )}>
          <div className="text-blue-600 font-bold text-xs animate-pulse">
            DLM
          </div>
        </div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-500 rounded-full transform -translate-x-1/2 translate-y-1"></div>
        </div>
      </div>
    </div>
  );
};

// SEO Analysis themed spinner
export const SEOAnalysisSpinner: FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        {/* Search magnifying glass */}
        <div className={cn(
          'border-2 border-green-400 rounded-full flex items-center justify-center',
          sizeClasses[size]
        )}>
          <svg className="w-6 h-6 text-green-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Rotating data points */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
          <div className="absolute -right-1 top-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2"></div>
          <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-yellow-500 rounded-full transform -translate-x-1/2"></div>
          <div className="absolute -left-1 top-1/2 w-2 h-2 bg-purple-500 rounded-full transform -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

// Performance metrics spinner
export const PerformanceSpinner: FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        {/* Speedometer-like design */}
        <div className="relative w-16 h-16 border-4 border-gray-200 rounded-full">
          <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute inset-4 border-4 border-transparent border-t-red-500 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
          
          {/* Center indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading message component with branded spinner
export const LoadingMessage: FC<{
  message: string;
  variant?: 'default' | 'analysis' | 'seo' | 'performance' | 'share';
  size?: 'sm' | 'md' | 'lg';
}> = ({ message, variant = 'default', size = 'md' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <LoadingSpinner variant={variant} size={size} />
      <p className="text-slate-600 dark:text-slate-400 text-center animate-pulse">
        {message}
      </p>
    </div>
  );
};

// Full-screen loading overlay
export const LoadingOverlay: FC<{
  message: string;
  variant?: 'default' | 'analysis' | 'seo' | 'performance' | 'share';
}> = ({ message, variant = 'default' }) => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
        <LoadingMessage message={message} variant={variant} size="lg" />
      </div>
    </div>
  );
};