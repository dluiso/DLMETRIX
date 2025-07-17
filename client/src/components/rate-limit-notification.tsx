import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { AlertCircle, Clock, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RateLimitNotificationProps {
  error: {
    type: 'rate_limit';
    message: string;
    timeRemaining?: number;
  } | null;
  onClose: () => void;
}

export function RateLimitNotification({ error, onClose }: RateLimitNotificationProps) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState<number>(error?.timeRemaining || 0);

  useEffect(() => {
    if (!error || error.type !== 'rate_limit') return;

    setCountdown(error.timeRemaining || 0);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [error, onClose]);

  if (!error || error.type !== 'rate_limit') return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">{t('rateLimitTitle')}</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span className="font-mono">{countdown}s</span>
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface QueueStatusProps {
  queueStatus: {
    activeAnalyses: number;
    queueLength: number;
    maxConcurrent: number;
    rateLimitSeconds: number;
  } | null;
  userPosition?: number;
}

export function QueueStatus({ queueStatus, userPosition }: QueueStatusProps) {
  const { t } = useTranslation();

  if (!queueStatus) return null;

  const { activeAnalyses, queueLength, maxConcurrent } = queueStatus;

  // Don't show if no queue or activity
  if (activeAnalyses === 0 && queueLength === 0) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
        <Users className="h-4 w-4" />
        <span className="font-medium">{t('queueStatus')}</span>
      </div>
      
      <div className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-300">
        <p>{t('activeAnalyses')}: {activeAnalyses}/{maxConcurrent}</p>
        
        {queueLength > 0 && (
          <p>{t('queueLength')}: {queueLength}</p>
        )}
        
        {userPosition && userPosition > 0 && (
          <p className="font-medium">{t('yourPosition')}: {userPosition}</p>
        )}
      </div>
      
      {queueLength > 0 && (
        <div className="mt-2">
          <div className="w-full bg-blue-200 rounded-full h-2 dark:bg-blue-700">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 dark:bg-blue-400"
              style={{ width: `${Math.min(100, (activeAnalyses / maxConcurrent) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-blue-500 mt-1 dark:text-blue-400">
            {t('processingCapacity')}: {((activeAnalyses / maxConcurrent) * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
}