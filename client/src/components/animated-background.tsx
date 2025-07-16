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
      
      {/* Left side - Website being built/improved */}
      <div className="absolute left-0 top-0 w-1/2 h-full opacity-20 dark:opacity-15">
        {/* Construction scaffolding */}
        <div className="absolute top-1/6 left-1/6 w-1 h-32 bg-orange-300 dark:bg-orange-600 animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/6 left-1/4 w-1 h-32 bg-orange-300 dark:bg-orange-600 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-1/6 left-1/3 w-1 h-32 bg-orange-300 dark:bg-orange-600 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        
        {/* Horizontal construction beams */}
        <div className="absolute top-1/4 left-1/6 w-20 h-1 bg-orange-400 dark:bg-orange-700 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-1/3 left-1/6 w-20 h-1 bg-orange-400 dark:bg-orange-700 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-2/5 left-1/6 w-20 h-1 bg-orange-400 dark:bg-orange-700 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        
        {/* Building blocks being placed */}
        <div className="absolute top-1/2 left-1/6 w-8 h-6 bg-blue-300 dark:bg-blue-700 rounded animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-6 bg-green-300 dark:bg-green-700 rounded animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '2.2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-6 bg-purple-300 dark:bg-purple-700 rounded animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '2.4s' }}></div>
        
        {/* Construction tools */}
        <div className="absolute top-3/5 left-1/5 w-6 h-6 border-2 border-yellow-400 dark:border-yellow-600 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-1/2 left-1/2 w-1 h-3 bg-yellow-400 dark:bg-yellow-600 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Progress indicators */}
        <div className="absolute top-3/4 left-1/6 w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-400 to-yellow-400 dark:from-red-600 dark:to-yellow-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        
        {/* Floating construction elements */}
        <div className="absolute top-1/8 left-1/4 w-3 h-3 bg-orange-300 dark:bg-orange-600 rounded-full animate-float" style={{ animationDelay: '0.2s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/8 left-1/3 w-2 h-2 bg-blue-300 dark:bg-blue-600 rounded-full animate-float" style={{ animationDelay: '0.8s', animationDuration: '3.5s' }}></div>
      </div>
      
      {/* Right side - Completed optimized website reaching #1 */}
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 dark:opacity-15">
        {/* Completed website structure */}
        <div className="absolute top-1/6 right-1/6 w-24 h-32 bg-gradient-to-t from-green-300 via-blue-300 to-purple-300 dark:from-green-700 dark:via-blue-700 dark:to-purple-700 rounded-t-lg animate-pulse" style={{ animationDelay: '0s' }}></div>
        
        {/* Success indicators */}
        <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-green-400 dark:bg-green-600 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-1/3 right-1/5 w-6 h-6 bg-blue-400 dark:bg-blue-600 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.3s' }}>
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        
        {/* Rising ranking ladder */}
        <div className="absolute top-3/5 right-1/4 space-y-2">
          <div className="w-8 h-6 bg-red-300 dark:bg-red-700 rounded text-xs flex items-center justify-center text-white font-bold animate-bounce" style={{ animationDelay: '0.1s' }}>10</div>
          <div className="w-8 h-6 bg-orange-300 dark:bg-orange-700 rounded text-xs flex items-center justify-center text-white font-bold animate-bounce" style={{ animationDelay: '0.2s' }}>8</div>
          <div className="w-8 h-6 bg-yellow-300 dark:bg-yellow-700 rounded text-xs flex items-center justify-center text-white font-bold animate-bounce" style={{ animationDelay: '0.3s' }}>5</div>
          <div className="w-8 h-6 bg-blue-300 dark:bg-blue-700 rounded text-xs flex items-center justify-center text-white font-bold animate-bounce" style={{ animationDelay: '0.4s' }}>3</div>
          <div className="w-10 h-8 bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-700 rounded-full text-sm flex items-center justify-center text-white font-bold shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>1</div>
        </div>
        
        {/* Trophy and success elements */}
        <div className="absolute top-1/6 right-1/3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-600 dark:to-orange-600 rounded-full animate-pulse">
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-200 dark:bg-yellow-800 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Performance metrics */}
        <div className="absolute top-1/2 right-1/6 space-y-1">
          <div className="w-12 h-1 bg-green-400 dark:bg-green-600 rounded-full animate-pulse"></div>
          <div className="w-10 h-1 bg-blue-400 dark:bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-11 h-1 bg-purple-400 dark:bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
      
      {/* Central transformation flow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-2 opacity-25 dark:opacity-20">
        <div className="w-full h-full bg-gradient-to-r from-orange-300 via-yellow-300 via-blue-300 to-green-300 dark:from-orange-700 dark:via-yellow-700 dark:via-blue-700 dark:to-green-700 rounded-full animate-pulse"></div>
        
        {/* Flowing improvement particles */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-orange-400 dark:bg-orange-600 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 dark:bg-yellow-600 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-0 left-2/4 w-2 h-2 bg-blue-400 dark:bg-blue-600 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
        <div className="absolute top-0 left-3/4 w-2 h-2 bg-green-400 dark:bg-green-600 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
      </div>
      
      {/* Floating improvement bubbles */}
      <div className="absolute top-1/6 left-1/3 w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full opacity-30 animate-float" style={{ animationDelay: '0.3s', animationDuration: '3s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-green-200 dark:bg-green-800 rounded-full opacity-30 animate-float" style={{ animationDelay: '0.8s', animationDuration: '2.5s' }}></div>
      <div className="absolute top-2/3 left-1/2 w-3 h-3 bg-purple-200 dark:bg-purple-800 rounded-full opacity-30 animate-float" style={{ animationDelay: '1.2s', animationDuration: '2s' }}></div>
      <div className="absolute top-5/6 right-1/5 w-5 h-5 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-30 animate-float" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}></div>
    </div>
  );
};

export default AnimatedBackground;