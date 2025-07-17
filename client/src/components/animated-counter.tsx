import { FC, useEffect, useRef, useState } from "react";

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
  const [currentValue, setCurrentValue] = useState(0);
  const animationRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const runAnimation = () => {
      if (isAnimatingRef.current) return;
      
      isAnimatingRef.current = true;
      setCurrentValue(0);
      
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        // Smooth easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const newValue = Math.round(targetValue * easeOut);
        
        setCurrentValue(newValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          isAnimatingRef.current = false;
          // Schedule next animation cycle
          timeoutRef.current = setTimeout(() => {
            runAnimation();
          }, 2000); // 2 seconds pause between cycles
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
      isAnimatingRef.current = false;
    };
  }, [targetValue, duration, delay]);

  return (
    <span 
      className={`font-bold text-gray-600 dark:text-gray-400 opacity-70 ${className}`}
      style={{ 
        position: 'absolute',
        top: '0px',
        left: '100%',
        marginLeft: '8px',
        whiteSpace: 'nowrap',
        lineHeight: '1',
        width: '40px',
        textAlign: 'left',
        fontSize: 'inherit',
        fontWeight: 'bold',
        display: 'inline-block'
      }}
    >
      {currentValue}%
    </span>
  );
};