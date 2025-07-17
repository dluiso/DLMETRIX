import { FC } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
}

export const AnimatedBackground: FC<AnimatedBackgroundProps> = ({ className }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 opacity-50" />
      
      {/* Progressive Growth Lines Animation */}
      <div className="absolute inset-0 opacity-15 dark:opacity-10">
        
        {/* Line 1 - Thick, left side - reaches 100% */}
        <div className="absolute animate-progress-line-full" style={{ 
          left: '15%', 
          bottom: '0%', 
          width: '4px', 
          height: '75%', 
          background: 'linear-gradient(to top, #EF4444, #F97316, #EAB308, #3B82F6, #10B981)',
          transformOrigin: 'bottom',
          animationDelay: '0s',
          animationDuration: '10s'
        }}>
          {/* Incremental progress numbers */}
          <div className="absolute left-6 bottom-1/10 w-8 h-8 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '1s' }}>10%</div>
          <div className="absolute left-6 bottom-1/5 w-8 h-8 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '2s' }}>25%</div>
          <div className="absolute left-6 bottom-2/5 w-8 h-8 bg-yellow-500 dark:bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '4s' }}>50%</div>
          <div className="absolute left-6 bottom-3/5 w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '6s' }}>75%</div>
          <div className="absolute left-6 bottom-4/5 w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '8s' }}>100%</div>
        </div>
        
        {/* Line 2 - Medium, center-left - reaches 30% */}
        <div className="absolute animate-progress-line-30" style={{ 
          left: '35%', 
          bottom: '0%', 
          width: '2.5px', 
          height: '30%', 
          background: 'linear-gradient(to top, #EF4444, #F97316, #EAB308)',
          transformOrigin: 'bottom',
          animationDelay: '0.8s',
          animationDuration: '6s'
        }}>
          {/* Progress numbers for 30% */}
          <div className="absolute left-5 bottom-1/3 w-7 h-7 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '2.5s' }}>10%</div>
          <div className="absolute left-5 bottom-2/3 w-7 h-7 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '4s' }}>20%</div>
          <div className="absolute left-5 top-0 w-7 h-7 bg-yellow-500 dark:bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '5.5s' }}>30%</div>
        </div>
        
        {/* Line 3 - Thin, center - reaches 45% */}
        <div className="absolute animate-progress-line-45" style={{ 
          left: '50%', 
          bottom: '0%', 
          width: '1.5px', 
          height: '45%', 
          background: 'linear-gradient(to top, #EF4444, #F97316, #EAB308, #3B82F6)',
          transformOrigin: 'bottom',
          animationDelay: '1.5s',
          animationDuration: '7s'
        }}>
          {/* Progress numbers for 45% */}
          <div className="absolute left-4 bottom-1/4 w-6 h-6 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '2.8s' }}>15%</div>
          <div className="absolute left-4 bottom-2/4 w-6 h-6 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '4.5s' }}>30%</div>
          <div className="absolute left-4 top-0 w-6 h-6 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '6.5s' }}>45%</div>
        </div>
        
        {/* Line 4 - Medium-thick, center-right - reaches 55% */}
        <div className="absolute animate-progress-line-55" style={{ 
          left: '65%', 
          bottom: '0%', 
          width: '3px', 
          height: '55%', 
          background: 'linear-gradient(to top, #EF4444, #F97316, #EAB308, #3B82F6)',
          transformOrigin: 'bottom',
          animationDelay: '0.3s',
          animationDuration: '8s'
        }}>
          {/* Progress numbers for 55% */}
          <div className="absolute left-5 bottom-1/5 w-7 h-7 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '2s' }}>15%</div>
          <div className="absolute left-5 bottom-2/5 w-7 h-7 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '4s' }}>35%</div>
          <div className="absolute left-5 top-0 w-7 h-7 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '6.5s' }}>55%</div>
        </div>
        
        {/* Line 5 - Thick, right side - reaches 100% */}
        <div className="absolute animate-progress-line-full" style={{ 
          left: '80%', 
          bottom: '0%', 
          width: '3.5px', 
          height: '75%', 
          background: 'linear-gradient(to top, #EF4444, #F97316, #EAB308, #3B82F6, #10B981)',
          transformOrigin: 'bottom',
          animationDelay: '1.2s',
          animationDuration: '10s'
        }}>
          {/* Incremental progress numbers */}
          <div className="absolute left-5 bottom-1/10 w-8 h-8 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '2.2s' }}>10%</div>
          <div className="absolute left-5 bottom-1/5 w-8 h-8 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '3.2s' }}>25%</div>
          <div className="absolute left-5 bottom-2/5 w-8 h-8 bg-yellow-500 dark:bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '5.2s' }}>50%</div>
          <div className="absolute left-5 bottom-3/5 w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '7.2s' }}>75%</div>
          <div className="absolute left-5 bottom-4/5 w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-number" style={{ animationDelay: '9.2s' }}>100%</div>
        </div>
        
        {/* Discrete Fireworks Effect at 100% completion */}
        <div className="absolute left-1/2 top-1/4 transform -translate-x-1/2 animate-fireworks" style={{ animationDelay: '8s' }}>
          {/* Central burst */}
          <div className="absolute w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
          
          {/* Radiating sparkles */}
          <div className="absolute -top-4 -left-1 w-1 h-1 bg-yellow-400 dark:bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute -top-3 left-3 w-1 h-1 bg-blue-400 dark:bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -top-1 left-4 w-1 h-1 bg-purple-400 dark:bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute top-2 left-3 w-1 h-1 bg-pink-400 dark:bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute top-3 -left-1 w-1 h-1 bg-orange-400 dark:bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-2 -left-4 w-1 h-1 bg-red-400 dark:bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute -top-1 -left-4 w-1 h-1 bg-teal-400 dark:bg-teal-500 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute -top-3 -left-3 w-1 h-1 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
        </div>
      </div>
      
      {/* Subtle floating improvement particles */}
      <div className="absolute top-1/6 left-1/3 w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-float" style={{ animationDelay: '0.3s', animationDuration: '3s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-200 dark:bg-green-800 rounded-full opacity-20 animate-float" style={{ animationDelay: '0.8s', animationDuration: '2.5s' }}></div>
      <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.2s', animationDuration: '2s' }}></div>
      <div className="absolute top-5/6 right-1/5 w-2 h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}></div>
    </div>
  );
};

export default AnimatedBackground;