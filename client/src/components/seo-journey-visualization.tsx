import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Target, 
  Star,
  Flag,
  Zap,
  Award,
  MapPin
} from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  impact: string;
  scoreImprovement: number;
  category: 'performance' | 'seo' | 'accessibility' | 'best-practices';
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SeoJourneyVisualizationProps {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  language?: 'en' | 'es';
}

export default function SeoJourneyVisualization({ 
  performanceScore, 
  accessibilityScore, 
  bestPracticesScore, 
  seoScore,
  language = 'en'
}: SeoJourneyVisualizationProps) {
  const t = getTranslations(language);
  
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const generateJourneySteps = (): JourneyStep[] => {
    const steps: JourneyStep[] = [];
    
    // Step 1: Quick wins (always first)
    steps.push({
      id: 'quick-wins',
      title: language === 'es' ? 'Victorias Rápidas' : 'Quick Wins',
      description: language === 'es' ? 'Optimizaciones básicas con impacto inmediato' : 'Basic optimizations with immediate impact',
      status: 'completed',
      impact: language === 'es' ? 'Mejora inmediata en ranking' : 'Immediate ranking improvement',
      scoreImprovement: 15,
      category: 'seo',
      estimatedTime: '1-2 hours',
      difficulty: 'easy'
    });
    
    // Step 2: Performance optimization
    if (performanceScore < 80) {
      steps.push({
        id: 'performance-opt',
        title: language === 'es' ? 'Optimización de Rendimiento' : 'Performance Optimization',
        description: language === 'es' ? 'Mejora la velocidad de carga y Core Web Vitals' : 'Improve loading speed and Core Web Vitals',
        status: 'current',
        impact: language === 'es' ? 'Mejor experiencia de usuario' : 'Better user experience',
        scoreImprovement: 20,
        category: 'performance',
        estimatedTime: '3-4 hours',
        difficulty: 'medium'
      });
    }
    
    // Step 3: Content optimization
    if (seoScore < 85) {
      steps.push({
        id: 'content-opt',
        title: language === 'es' ? 'Optimización de Contenido' : 'Content Optimization',
        description: language === 'es' ? 'Mejora estructura de contenido y palabras clave' : 'Improve content structure and keywords',
        status: steps.length > 1 ? 'upcoming' : 'current',
        impact: language === 'es' ? 'Mayor relevancia en búsquedas' : 'Higher search relevance',
        scoreImprovement: 25,
        category: 'seo',
        estimatedTime: '2-3 hours',
        difficulty: 'medium'
      });
    }
    
    // Step 4: Accessibility improvements
    if (accessibilityScore < 85) {
      steps.push({
        id: 'accessibility-imp',
        title: language === 'es' ? 'Mejoras de Accesibilidad' : 'Accessibility Improvements',
        description: language === 'es' ? 'Haz tu sitio accesible para todos' : 'Make your site accessible to everyone',
        status: 'upcoming',
        impact: language === 'es' ? 'Alcance más amplio de audiencia' : 'Broader audience reach',
        scoreImprovement: 18,
        category: 'accessibility',
        estimatedTime: '2-3 hours',
        difficulty: 'medium'
      });
    }
    
    // Step 5: Technical excellence
    if (bestPracticesScore < 85) {
      steps.push({
        id: 'technical-excellence',
        title: language === 'es' ? 'Excelencia Técnica' : 'Technical Excellence',
        description: language === 'es' ? 'Implementa las mejores prácticas web' : 'Implement web best practices',
        status: 'upcoming',
        impact: language === 'es' ? 'Sitio más seguro y confiable' : 'More secure and reliable site',
        scoreImprovement: 22,
        category: 'best-practices',
        estimatedTime: '3-4 hours',
        difficulty: 'hard'
      });
    }
    
    // Step 6: Advanced optimization
    steps.push({
      id: 'advanced-opt',
      title: language === 'es' ? 'Optimización Avanzada' : 'Advanced Optimization',
      description: language === 'es' ? 'Técnicas avanzadas para máximo rendimiento' : 'Advanced techniques for maximum performance',
      status: 'upcoming',
      impact: language === 'es' ? 'Rendimiento de clase mundial' : 'World-class performance',
      scoreImprovement: 30,
      category: 'performance',
      estimatedTime: '4-6 hours',
      difficulty: 'hard'
    });
    
    return steps;
  };
  
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>(generateJourneySteps());
  
  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    
    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= journeySteps.length - 1) {
          clearInterval(interval);
          setIsAnimating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };
  
  const getCategoryColor = (category: JourneyStep['category']) => {
    switch (category) {
      case 'performance': return 'bg-blue-500';
      case 'seo': return 'bg-green-500';
      case 'accessibility': return 'bg-purple-500';
      case 'best-practices': return 'bg-orange-500';
    }
  };
  
  const getStatusIcon = (status: JourneyStep['status'], index: number) => {
    if (status === 'completed' || (isAnimating && index <= animationStep)) {
      return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
    }
    if (status === 'current') {
      return <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />;
    }
    return <Target className="w-6 h-6 text-gray-400 dark:text-gray-500" />;
  };
  
  const getDifficultyBadge = (difficulty: JourneyStep['difficulty']) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      hard: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    
    return (
      <Badge className={colors[difficulty]}>
        {difficulty}
      </Badge>
    );
  };
  
  const totalImprovementPotential = journeySteps.reduce((sum, step) => sum + step.scoreImprovement, 0);
  const completedSteps = journeySteps.filter(step => step.status === 'completed').length;
  const totalSteps = journeySteps.length;
  const journeyProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-200">
            <MapPin className="w-5 h-5" />
            <span>{language === 'es' ? 'Viaje de Mejora SEO' : 'SEO Improvement Journey'}</span>
          </CardTitle>
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isAnimating ? (
              <>
                <Zap className="w-4 h-4 mr-1 animate-spin" />
                {language === 'es' ? 'Animando...' : 'Animating...'}
              </>
            ) : (
              <>
                <Flag className="w-4 h-4 mr-1" />
                {language === 'es' ? 'Ver Progreso' : 'Show Progress'}
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-indigo-700 dark:text-indigo-300">
            <span>{language === 'es' ? 'Progreso del Viaje' : 'Journey Progress'}</span>
            <span>{completedSteps}/{totalSteps} {language === 'es' ? 'pasos completados' : 'steps completed'}</span>
          </div>
          <Progress value={journeyProgress} className="h-2 bg-indigo-200 dark:bg-indigo-800" />
          <div className="text-xs text-indigo-600 dark:text-indigo-400">
            <Star className="w-3 h-3 inline mr-1" />
            {language === 'es' ? 'Potencial de mejora:' : 'Improvement potential:'} +{totalImprovementPotential} {language === 'es' ? 'puntos' : 'points'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          {/* Journey timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-700"></div>
          
          {journeySteps.map((step, index) => (
            <div 
              key={step.id}
              className={`relative flex items-start space-x-4 pb-6 transition-all duration-500 ${
                isAnimating && index <= animationStep ? 'animate-pulse' : ''
              }`}
            >
              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-full border-2 border-indigo-200 dark:border-indigo-700">
                {getStatusIcon(step.status, index)}
              </div>
              
              {/* Step content */}
              <div className={`flex-1 min-w-0 p-4 rounded-lg border transition-all duration-300 ${
                step.status === 'completed' || (isAnimating && index <= animationStep)
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : step.status === 'current'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white/70 dark:bg-white/5 border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(step.category)}`}></div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{step.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDifficultyBadge(step.difficulty)}
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{step.scoreImprovement}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {step.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                    <span>⏱️ {step.estimatedTime}</span>
                    <span>🎯 {step.impact}</span>
                  </div>
                  
                  {step.status === 'completed' && (
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">{language === 'es' ? 'Completado' : 'Completed'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Arrow connector */}
              {index < journeySteps.length - 1 && (
                <div className="absolute left-6 top-12 z-0">
                  <ArrowRight className="w-4 h-4 text-indigo-400 dark:text-indigo-500 transform rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
          <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
            {language === 'es' ? 'Resumen del Viaje' : 'Journey Summary'}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-indigo-700 dark:text-indigo-300">
                {language === 'es' ? 'Tiempo total estimado:' : 'Total estimated time:'}
              </span>
              <div className="font-medium text-indigo-900 dark:text-indigo-100">
                {journeySteps.length * 2.5} {language === 'es' ? 'horas' : 'hours'}
              </div>
            </div>
            <div>
              <span className="text-indigo-700 dark:text-indigo-300">
                {language === 'es' ? 'Mejora potencial:' : 'Potential improvement:'}
              </span>
              <div className="font-medium text-indigo-900 dark:text-indigo-100">
                +{totalImprovementPotential} {language === 'es' ? 'puntos' : 'points'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}