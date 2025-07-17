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
      
      {/* Converging Lines Animation */}
      <div className="absolute inset-0 opacity-15 dark:opacity-10">
        
        {/* Line 1 - Blue, thick */}
        <div className="absolute animate-draw-line" style={{ 
          left: '10%', 
          top: '80%', 
          width: '2px', 
          height: '60%', 
          background: 'linear-gradient(to top, #3B82F6, #10B981)',
          transformOrigin: 'bottom',
          transform: 'rotate(-15deg)',
          animationDelay: '0s',
          animationDuration: '4s'
        }}>
          {/* Arrow tip */}
          <div className="absolute -top-2 -left-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-500 animate-pulse"></div>
          
          {/* Progress markers */}
          <div className="absolute left-4 top-4/5 w-6 h-6 bg-blue-400 dark:bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '0.5s' }}>5</div>
          <div className="absolute left-4 top-3/5 w-6 h-6 bg-blue-500 dark:bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '1s' }}>20</div>
          <div className="absolute left-4 top-2/5 w-6 h-6 bg-purple-500 dark:bg-purple-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '1.5s' }}>40</div>
          <div className="absolute left-4 top-1/5 w-6 h-6 bg-green-500 dark:bg-green-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2s' }}>75</div>
          <div className="absolute left-4 top-0 w-6 h-6 bg-green-600 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.5s' }}>89</div>
        </div>
        
        {/* Line 2 - Orange, medium */}
        <div className="absolute animate-draw-line" style={{ 
          left: '25%', 
          top: '85%', 
          width: '1.5px', 
          height: '65%', 
          background: 'linear-gradient(to top, #F97316, #10B981)',
          transformOrigin: 'bottom',
          transform: 'rotate(-8deg)',
          animationDelay: '0.5s',
          animationDuration: '4.2s'
        }}>
          {/* Arrow tip */}
          <div className="absolute -top-2 -left-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-500 animate-pulse"></div>
          
          {/* Progress markers */}
          <div className="absolute left-4 top-4/5 w-5 h-5 bg-orange-400 dark:bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '0.8s' }}>5</div>
          <div className="absolute left-4 top-3/5 w-5 h-5 bg-orange-500 dark:bg-orange-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '1.3s' }}>20</div>
          <div className="absolute left-4 top-2/5 w-5 h-5 bg-yellow-500 dark:bg-yellow-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '1.8s' }}>40</div>
          <div className="absolute left-4 top-1/5 w-5 h-5 bg-green-500 dark:bg-green-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.3s' }}>75</div>
          <div className="absolute left-4 top-0 w-5 h-5 bg-green-600 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.8s' }}>89</div>
        </div>
        
        {/* Line 3 - Purple, thin */}
        <div className="absolute animate-draw-line" style={{ 
          left: '70%', 
          top: '90%', 
          width: '1px', 
          height: '70%', 
          background: 'linear-gradient(to top, #8B5CF6, #10B981)',
          transformOrigin: 'bottom',
          transform: 'rotate(12deg)',
          animationDelay: '1s',
          animationDuration: '3.8s'
        }}>
          {/* Arrow tip */}
          <div className="absolute -top-2 -left-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-500 animate-pulse"></div>
          
          {/* Progress markers */}
          <div className="absolute left-4 top-4/5 w-5 h-5 bg-purple-400 dark:bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '1.3s' }}>5</div>
          <div className="absolute left-4 top-3/5 w-5 h-5 bg-purple-500 dark:bg-purple-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '1.8s' }}>20</div>
          <div className="absolute left-4 top-2/5 w-5 h-5 bg-indigo-500 dark:bg-indigo-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.3s' }}>40</div>
          <div className="absolute left-4 top-1/5 w-5 h-5 bg-green-500 dark:bg-green-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.8s' }}>75</div>
          <div className="absolute left-4 top-0 w-5 h-5 bg-green-600 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '3.3s' }}>89</div>
        </div>
        
        {/* Line 4 - Green, medium-thick */}
        <div className="absolute animate-draw-line" style={{ 
          left: '85%', 
          top: '82%', 
          width: '1.8px', 
          height: '58%', 
          background: 'linear-gradient(to top, #059669, #10B981)',
          transformOrigin: 'bottom',
          transform: 'rotate(20deg)',
          animationDelay: '1.5s',
          animationDuration: '4.5s'
        }}>
          {/* Arrow tip */}
          <div className="absolute -top-2 -left-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-500 animate-pulse"></div>
          
          {/* Progress markers */}
          <div className="absolute left-4 top-4/5 w-5 h-5 bg-emerald-400 dark:bg-emerald-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '1.8s' }}>5</div>
          <div className="absolute left-4 top-3/5 w-5 h-5 bg-emerald-500 dark:bg-emerald-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.3s' }}>20</div>
          <div className="absolute left-4 top-2/5 w-5 h-5 bg-green-500 dark:bg-green-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.8s' }}>40</div>
          <div className="absolute left-4 top-1/5 w-5 h-5 bg-green-600 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '3.3s' }}>75</div>
          <div className="absolute left-4 top-0 w-5 h-5 bg-green-700 dark:bg-green-900 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '3.8s' }}>89</div>
        </div>
        
        {/* Line 5 - Teal, thin */}
        <div className="absolute animate-draw-line" style={{ 
          left: '50%', 
          top: '88%', 
          width: '1.2px', 
          height: '65%', 
          background: 'linear-gradient(to top, #0D9488, #10B981)',
          transformOrigin: 'bottom',
          transform: 'rotate(5deg)',
          animationDelay: '2s',
          animationDuration: '4.1s'
        }}>
          {/* Arrow tip */}
          <div className="absolute -top-2 -left-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-500 animate-pulse"></div>
          
          {/* Progress markers */}
          <div className="absolute left-4 top-4/5 w-5 h-5 bg-teal-400 dark:bg-teal-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.3s' }}>5</div>
          <div className="absolute left-4 top-3/5 w-5 h-5 bg-teal-500 dark:bg-teal-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '2.8s' }}>20</div>
          <div className="absolute left-4 top-2/5 w-5 h-5 bg-cyan-500 dark:bg-cyan-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '3.3s' }}>40</div>
          <div className="absolute left-4 top-1/5 w-5 h-5 bg-green-500 dark:bg-green-700 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '3.8s' }}>75</div>
          <div className="absolute left-4 top-0 w-5 h-5 bg-green-600 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce" style={{ animationDelay: '4.3s' }}>89</div>
        </div>
        
        {/* Convergence Point - Number 1 with sparkles */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 animate-sparkle" style={{ animationDelay: '4s' }}>
          <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 via-green-500 to-green-600 dark:from-green-600 dark:via-green-700 dark:to-green-800 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-2xl font-bold text-white">1</span>
            
            {/* Sparkles around the number */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-green-300 dark:bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
            <div className="absolute top-1/2 -left-2 w-1 h-1 bg-purple-400 dark:bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
            <div className="absolute top-1/2 -right-2 w-1 h-1 bg-pink-400 dark:bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          </div>
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