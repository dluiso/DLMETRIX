import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  CheckCircle, 
  Clock, 
  Star, 
  Award,
  Zap,
  TrendingUp,
  Users,
  Shield,
  Search,
  Rocket
} from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'seo' | 'accessibility' | 'best-practices';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeEstimate: string;
  completed: boolean;
  progress: number;
  steps: string[];
  reward: string;
}

interface GamifiedChallengesProps {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  language?: 'en' | 'es';
}

export default function GamifiedChallenges({ 
  performanceScore, 
  accessibilityScore, 
  bestPracticesScore, 
  seoScore,
  language = 'en'
}: GamifiedChallengesProps) {
  const t = getTranslations(language);
  
  // Generate challenges based on current scores
  const generateChallenges = (): Challenge[] => {
    const challenges: Challenge[] = [];
    
    // Performance challenges
    if (performanceScore < 90) {
      challenges.push({
        id: 'optimize-images',
        title: language === 'es' ? 'Optimizar Imágenes' : 'Optimize Images',
        description: language === 'es' ? 'Reduce el tamaño de las imágenes para mejorar la velocidad de carga' : 'Reduce image sizes to improve loading speed',
        category: 'performance',
        difficulty: 'easy',
        points: 50,
        timeEstimate: '15 min',
        completed: false,
        progress: 0,
        steps: [
          language === 'es' ? 'Identifica imágenes grandes (>100KB)' : 'Identify large images (>100KB)',
          language === 'es' ? 'Comprime imágenes usando herramientas como TinyPNG' : 'Compress images using tools like TinyPNG',
          language === 'es' ? 'Convierte a formatos modernos (WebP, AVIF)' : 'Convert to modern formats (WebP, AVIF)',
          language === 'es' ? 'Implementa lazy loading' : 'Implement lazy loading'
        ],
        reward: language === 'es' ? 'Velocidad de carga 20% más rápida' : '20% faster loading speed'
      });
    }
    
    // SEO challenges
    if (seoScore < 90) {
      challenges.push({
        id: 'improve-meta-tags',
        title: language === 'es' ? 'Mejorar Meta Tags' : 'Improve Meta Tags',
        description: language === 'es' ? 'Optimiza títulos y descripciones para mejores resultados de búsqueda' : 'Optimize titles and descriptions for better search results',
        category: 'seo',
        difficulty: 'easy',
        points: 40,
        timeEstimate: '10 min',
        completed: false,
        progress: 0,
        steps: [
          language === 'es' ? 'Revisa la longitud del título (50-60 caracteres)' : 'Check title length (50-60 characters)',
          language === 'es' ? 'Optimiza meta description (150-160 caracteres)' : 'Optimize meta description (150-160 characters)',
          language === 'es' ? 'Incluye palabras clave relevantes' : 'Include relevant keywords',
          language === 'es' ? 'Asegúrate de que sea único y descriptivo' : 'Make sure it\'s unique and descriptive'
        ],
        reward: language === 'es' ? 'Mejor ranking en búsquedas' : 'Better search ranking'
      });
    }
    
    // Accessibility challenges
    if (accessibilityScore < 90) {
      challenges.push({
        id: 'improve-accessibility',
        title: language === 'es' ? 'Mejorar Accesibilidad' : 'Improve Accessibility',
        description: language === 'es' ? 'Haz tu sitio más accesible para todos los usuarios' : 'Make your site accessible to all users',
        category: 'accessibility',
        difficulty: 'medium',
        points: 60,
        timeEstimate: '25 min',
        completed: false,
        progress: 0,
        steps: [
          language === 'es' ? 'Añade atributos alt a las imágenes' : 'Add alt attributes to images',
          language === 'es' ? 'Mejora el contraste de colores' : 'Improve color contrast',
          language === 'es' ? 'Asegura navegación por teclado' : 'Ensure keyboard navigation',
          language === 'es' ? 'Añade etiquetas ARIA cuando sea necesario' : 'Add ARIA labels when needed'
        ],
        reward: language === 'es' ? 'Sitio inclusivo para todos' : 'Inclusive site for everyone'
      });
    }
    
    // Best practices challenges
    if (bestPracticesScore < 90) {
      challenges.push({
        id: 'implement-security',
        title: language === 'es' ? 'Implementar Seguridad' : 'Implement Security',
        description: language === 'es' ? 'Añade medidas de seguridad esenciales' : 'Add essential security measures',
        category: 'best-practices',
        difficulty: 'medium',
        points: 70,
        timeEstimate: '20 min',
        completed: false,
        progress: 0,
        steps: [
          language === 'es' ? 'Configura headers de seguridad' : 'Configure security headers',
          language === 'es' ? 'Implementa HTTPS' : 'Implement HTTPS',
          language === 'es' ? 'Añade Content Security Policy' : 'Add Content Security Policy',
          language === 'es' ? 'Actualiza dependencias vulnerables' : 'Update vulnerable dependencies'
        ],
        reward: language === 'es' ? 'Sitio más seguro y confiable' : 'More secure and trusted site'
      });
    }
    
    return challenges;
  };
  
  const [challenges, setChallenges] = useState<Challenge[]>(generateChallenges());
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  
  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'seo': return <Search className="w-4 h-4" />;
      case 'accessibility': return <Users className="w-4 h-4" />;
      case 'best-practices': return <Shield className="w-4 h-4" />;
    }
  };
  
  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };
  
  const getCategoryColor = (category: Challenge['category']) => {
    switch (category) {
      case 'performance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'seo': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'accessibility': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'best-practices': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    }
  };
  
  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalChallenges = challenges.length;
  const overallProgress = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
  
  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };
  
  const completeChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === challengeId 
        ? { ...c, completed: true, progress: 100 }
        : c
    ));
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setTotalPoints(prev => prev + challenge.points);
      if (totalPoints + challenge.points >= userLevel * 100) {
        setUserLevel(prev => prev + 1);
      }
    }
    
    setSelectedChallenge(null);
  };
  
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-purple-800 dark:text-purple-200">
            <Trophy className="w-5 h-5" />
            <span>{language === 'es' ? 'Desafíos SEO' : 'SEO Challenges'}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
              <Star className="w-3 h-3 mr-1" />
              {language === 'es' ? 'Nivel' : 'Level'} {userLevel}
            </Badge>
            <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
              <Zap className="w-3 h-3 mr-1" />
              {totalPoints} {language === 'es' ? 'puntos' : 'points'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-purple-700 dark:text-purple-300">
            <span>{language === 'es' ? 'Progreso General' : 'Overall Progress'}</span>
            <span>{completedChallenges}/{totalChallenges} {language === 'es' ? 'completados' : 'completed'}</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-purple-200 dark:bg-purple-800" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div 
            key={challenge.id} 
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              challenge.completed 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-white/70 dark:bg-white/5 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {challenge.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  getCategoryIcon(challenge.category)
                )}
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{challenge.title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <Badge className={getCategoryColor(challenge.category)}>
                  {challenge.category}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {challenge.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{challenge.points} {language === 'es' ? 'pts' : 'pts'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{challenge.timeEstimate}</span>
                </div>
              </div>
              
              {!challenge.completed && (
                <Button 
                  size="sm" 
                  onClick={() => startChallenge(challenge)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Rocket className="w-4 h-4 mr-1" />
                  {language === 'es' ? 'Comenzar' : 'Start'}
                </Button>
              )}
            </div>
            
            {challenge.progress > 0 && challenge.progress < 100 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{language === 'es' ? 'Progreso' : 'Progress'}</span>
                  <span>{challenge.progress}%</span>
                </div>
                <Progress value={challenge.progress} className="h-1" />
              </div>
            )}
          </div>
        ))}
        
        {selectedChallenge && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {language === 'es' ? 'Pasos para completar:' : 'Steps to complete:'}
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200 mb-3">
              {selectedChallenge.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>{language === 'es' ? 'Recompensa:' : 'Reward:'}</strong> {selectedChallenge.reward}
              </div>
              <Button 
                size="sm" 
                onClick={() => completeChallenge(selectedChallenge.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {language === 'es' ? 'Marcar como Completado' : 'Mark as Complete'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}