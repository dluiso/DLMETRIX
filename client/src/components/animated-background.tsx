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
      
      {/* Left side - Website in maintenance/problems */}
      <div className="absolute left-0 top-0 w-1/2 h-full opacity-10 dark:opacity-5">
        {/* Broken website structure */}
        <div className="absolute top-1/4 left-1/4 w-16 h-3 bg-red-200 dark:bg-red-900 rounded animate-pulse"></div>
        <div className="absolute top-1/3 left-1/6 w-20 h-2 bg-red-300 dark:bg-red-800 rounded animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-2/5 left-1/4 w-12 h-2 bg-red-400 dark:bg-red-700 rounded animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Maintenance indicators */}
        <div className="absolute top-1/2 left-1/8 w-8 h-8 border-2 border-red-300 dark:border-red-700 rounded-full animate-spin" style={{ animationDuration: '4s' }}>
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-400 dark:bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Falling ranking indicators */}
        <div className="absolute top-3/5 left-1/3 animate-bounce" style={{ animationDelay: '0.2s' }}>
          <div className="w-6 h-6 bg-red-300 dark:bg-red-700 rounded text-xs flex items-center justify-center text-red-800 dark:text-red-200 font-bold">
            10
          </div>
        </div>
        <div className="absolute top-3/4 left-1/5 animate-bounce" style={{ animationDelay: '0.7s' }}>
          <div className="w-6 h-6 bg-orange-300 dark:bg-orange-700 rounded text-xs flex items-center justify-center text-orange-800 dark:text-orange-200 font-bold">
            8
          </div>
        </div>
      </div>
      
      {/* Right side - Optimized website climbing to #1 */}
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 dark:opacity-5">
        {/* Optimized website structure */}
        <div className="absolute top-1/4 right-1/4 w-16 h-3 bg-green-200 dark:bg-green-900 rounded animate-pulse"></div>
        <div className="absolute top-1/3 right-1/6 w-20 h-2 bg-green-300 dark:bg-green-800 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-2/5 right-1/4 w-12 h-2 bg-green-400 dark:bg-green-700 rounded animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        
        {/* Optimization indicators */}
        <div className="absolute top-1/2 right-1/8 w-8 h-8 border-2 border-green-300 dark:border-green-700 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-400 dark:bg-green-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Rising ranking indicators */}
        <div className="absolute top-3/5 right-1/3 animate-bounce" style={{ animationDelay: '0.1s' }}>
          <div className="w-6 h-6 bg-yellow-300 dark:bg-yellow-700 rounded text-xs flex items-center justify-center text-yellow-800 dark:text-yellow-200 font-bold">
            5
          </div>
        </div>
        <div className="absolute top-2/5 right-1/5 animate-bounce" style={{ animationDelay: '0.4s' }}>
          <div className="w-6 h-6 bg-blue-300 dark:bg-blue-700 rounded text-xs flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold">
            3
          </div>
        </div>
        <div className="absolute top-1/5 right-1/4 animate-bounce" style={{ animationDelay: '0.9s' }}>
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-700 rounded-full text-sm flex items-center justify-center text-white font-bold shadow-lg">
            1
          </div>
        </div>
      </div>
      
      {/* Subtle connecting flow lines */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-1 opacity-5 dark:opacity-3">
        <div className="w-full h-full bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 dark:from-red-700 dark:via-yellow-700 dark:to-green-700 rounded-full animate-pulse"></div>
        
        {/* Flowing particles */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-blue-400 dark:bg-blue-600 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-0 left-1/3 w-1 h-1 bg-green-400 dark:bg-green-600 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-0 left-2/3 w-1 h-1 bg-purple-400 dark:bg-purple-600 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Subtle SEO improvement indicators */}
      <div className="absolute bottom-1/4 left-1/4 opacity-8 dark:opacity-4">
        <div className="flex items-center space-x-1 animate-pulse">
          <div className="w-2 h-2 bg-red-400 dark:bg-red-600 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-600 rounded-full" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-green-400 dark:bg-green-600 rounded-full" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
      
      <div className="absolute bottom-1/4 right-1/4 opacity-8 dark:opacity-4">
        <div className="flex items-center space-x-1 animate-pulse">
          <div className="w-2 h-2 bg-green-400 dark:bg-green-600 rounded-full"></div>
          <div className="w-2 h-2 bg-green-400 dark:bg-green-600 rounded-full" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-green-400 dark:bg-green-600 rounded-full" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
      
      {/* Floating improvement bubbles */}
      <div className="absolute top-1/6 left-1/3 w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-ping" style={{ animationDelay: '0.3s', animationDuration: '3s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-green-200 dark:bg-green-800 rounded-full opacity-20 animate-ping" style={{ animationDelay: '0.8s', animationDuration: '2.5s' }}></div>
      <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-ping" style={{ animationDelay: '1.2s', animationDuration: '2s' }}></div>
      <div className="absolute top-5/6 right-1/5 w-3 h-3 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 animate-ping" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}></div>
    </div>
  );
};

export default AnimatedBackground;