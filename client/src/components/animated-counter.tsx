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
  const currentValueRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startAnimation = () => {
      if (!counterRef.current) return;
      
      const startTime = Date.now();
      const startValue = currentValueRef.current;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
        currentValueRef.current = currentValue;
        
        if (counterRef.current) {
          counterRef.current.textContent = `${currentValue}%`;
        }
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(startAnimation, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, delay]);

  return (
    <div 
      ref={counterRef}
      className={`font-bold text-gray-600 dark:text-gray-400 ${className}`}
    >
      0%
    </div>
  );
};