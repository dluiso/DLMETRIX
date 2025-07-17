import { FC, useEffect, useRef } from "react";

interface AnimatedCounterProps {
  targetValue: number;
  duration: number;
  delay: number;
  className?: string;
}

export const AnimatedCounter: FC<AnimatedCounterProps> = ({ 
  targetValue, 
  duration, 
  delay, 
  className = "" 
}) => {
  const counterRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const runAnimation = () => {
      if (!counterRef.current) return;
      
      // Reset to 0
      counterRef.current.textContent = "0%";
      
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        // Smooth easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = Math.round(targetValue * easeOut);
        
        if (counterRef.current) {
          counterRef.current.textContent = `${currentValue}%`;
        }
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Schedule next animation cycle
          timeoutRef.current = setTimeout(() => {
            runAnimation();
          }, 1000); // 1 second pause between cycles
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start first animation after delay
    timeoutRef.current = setTimeout(runAnimation, delay * 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, delay]);

  return (
    <div 
      ref={counterRef}
      className={`font-bold text-gray-600 dark:text-gray-400 opacity-75 ${className}`}
      style={{ 
        transform: 'none',
        position: 'relative',
        display: 'inline-block',
        minWidth: '3rem',
        textAlign: 'center'
      }}
    >
      0%
    </div>
  );
};