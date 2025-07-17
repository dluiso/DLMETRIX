import { FC } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './animated-counter';

interface AnimatedBackgroundProps {
  className?: string;
}

export const AnimatedBackground: FC<AnimatedBackgroundProps> = ({ className }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 opacity-50" />
      
      {/* Progressive Growth Lines Animation */}
      <div className="absolute inset-0 opacity-8 dark:opacity-5">
        
        {/* Line 1 - Thick, left side - reaches 100% */}
        <div className="absolute animate-progress-line-full" style={{ 
          left: '15%', 
          bottom: '0%', 
          width: '4px', 
          height: '75%', 
          background: 'linear-gradient(to top, #dc2626, #ea580c, #ca8a04, #2563eb, #16a34a)',
          transformOrigin: 'bottom',
          animationDelay: '0s',
          animationDuration: '10s'
        }}>
          {/* Incremental counter */}
          <div className="absolute left-6 top-0">
            <AnimatedCounter targetValue={100} duration={10} delay={0.5} className="text-xl" />
          </div>
        </div>
        
        {/* Line 2 - Medium, center-left - reaches 30% */}
        <div className="absolute animate-progress-line-30" style={{ 
          left: '35%', 
          bottom: '0%', 
          width: '2.5px', 
          height: '30%', 
          background: 'linear-gradient(to top, #dc2626, #ea580c, #ca8a04)',
          transformOrigin: 'bottom',
          animationDelay: '0.8s',
          animationDuration: '6s'
        }}>
          {/* Counter for 30% */}
          <div className="absolute left-5 top-0">
            <AnimatedCounter targetValue={30} duration={6} delay={1.3} className="text-lg" />
          </div>
        </div>
        
        {/* Line 3 - Thin, center - reaches 45% */}
        <div className="absolute animate-progress-line-45" style={{ 
          left: '50%', 
          bottom: '0%', 
          width: '1.5px', 
          height: '45%', 
          background: 'linear-gradient(to top, #dc2626, #ea580c, #ca8a04, #2563eb)',
          transformOrigin: 'bottom',
          animationDelay: '1.5s',
          animationDuration: '7s'
        }}>
          {/* Counter for 45% */}
          <div className="absolute left-4 top-0">
            <AnimatedCounter targetValue={45} duration={7} delay={2} className="text-base" />
          </div>
        </div>
        
        {/* Line 4 - Medium-thick, center-right - reaches 55% */}
        <div className="absolute animate-progress-line-55" style={{ 
          left: '65%', 
          bottom: '0%', 
          width: '3px', 
          height: '55%', 
          background: 'linear-gradient(to top, #dc2626, #ea580c, #ca8a04, #2563eb)',
          transformOrigin: 'bottom',
          animationDelay: '0.3s',
          animationDuration: '8s'
        }}>
          {/* Counter for 55% */}
          <div className="absolute left-5 top-0">
            <AnimatedCounter targetValue={55} duration={8} delay={0.8} className="text-lg" />
          </div>
        </div>
        
        {/* Line 5 - Thick, right side - reaches 100% */}
        <div className="absolute animate-progress-line-full" style={{ 
          left: '80%', 
          bottom: '0%', 
          width: '3.5px', 
          height: '75%', 
          background: 'linear-gradient(to top, #dc2626, #ea580c, #ca8a04, #2563eb, #16a34a)',
          transformOrigin: 'bottom',
          animationDelay: '1.2s',
          animationDuration: '10s'
        }}>
          {/* Incremental counter */}
          <div className="absolute left-5 top-0">
            <AnimatedCounter targetValue={100} duration={10} delay={1.7} className="text-xl" />
          </div>
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