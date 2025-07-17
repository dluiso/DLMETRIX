import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Link, Search, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTranslations } from "@/lib/translations";
import { DLMETRIXSpinner } from "@/components/loading-spinners";

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  language?: 'en' | 'es';
  currentUrl?: string;
}

export default function UrlInput({ onAnalyze, isLoading, language = 'en', currentUrl }: UrlInputProps) {
  const [url, setUrl] = useState(currentUrl || "");
  const { toast } = useToast();
  const t = getTranslations(language);

  // Update URL when currentUrl changes
  useEffect(() => {
    if (currentUrl && currentUrl !== url) {
      setUrl(currentUrl);
    }
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: language === 'en' ? "URL Required" : "URL Requerida",
        description: language === 'en' ? "Please enter a website URL to analyze." : "Por favor ingresa una URL de sitio web para analizar.",
        variant: "destructive",
      });
      return;
    }

    let finalUrl = url.trim();

    // Auto-add https:// if no protocol is provided
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    // Basic URL validation
    try {
      const urlObj = new URL(finalUrl);
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error('Invalid protocol');
      }
    } catch {
      toast({
        title: language === 'en' ? "Invalid URL" : "URL Inválida",
        description: language === 'en' ? "Please enter a valid website domain (e.g., example.com)." : "Por favor ingresa un dominio de sitio web válido (ej., ejemplo.com).",
        variant: "destructive",
      });
      return;
    }

    onAnalyze(finalUrl);
  };

  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Neon border effect - two lines meeting at center right */}
      <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
        {/* Top line - from center left to center right */}
        <div 
          className="absolute left-0 top-0 h-0.5 w-full"
          style={{
            background: 'linear-gradient(to right, transparent 0%, #ef4444 10%, #f97316 30%, #eab308 60%, #22c55e 100%)',
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
            filter: 'blur(0.5px)',
            animation: 'neon-glow 2s ease-in-out infinite alternate'
          }}
        />
        
        {/* Bottom line - from center left to center right */}
        <div 
          className="absolute left-0 bottom-0 h-0.5 w-full"
          style={{
            background: 'linear-gradient(to right, transparent 0%, #ef4444 10%, #f97316 30%, #eab308 60%, #22c55e 100%)',
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
            filter: 'blur(0.5px)',
            animation: 'neon-glow 2s ease-in-out infinite alternate',
            animationDelay: '0.5s'
          }}
        />
        
        {/* Right vertical line - connecting the two lines */}
        <div 
          className="absolute right-0 top-0 w-0.5 h-full"
          style={{
            background: 'linear-gradient(to bottom, #22c55e 0%, #22c55e 100%)',
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
            filter: 'blur(0.5px)',
            animation: 'neon-glow 2s ease-in-out infinite alternate',
            animationDelay: '1s'
          }}
        />
        
        {/* Left vertical line - starting point */}
        <div 
          className="absolute left-0 top-0 w-0.5 h-full"
          style={{
            background: 'linear-gradient(to bottom, #ef4444 0%, #ef4444 100%)',
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
            filter: 'blur(0.5px)',
            animation: 'neon-glow 2s ease-in-out infinite alternate',
            animationDelay: '1.5s'
          }}
        />
      </div>
      
      <Card className="relative z-10 shadow-elegant bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-fade-in">
        <CardContent className="p-4 sm:p-6">

        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100">
            {language === 'en' ? 'Website URL Analysis' : 'Análisis de URL del Sitio Web'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={t.enterUrl}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-4 pr-10 text-sm sm:text-base h-11 sm:h-12"
              disabled={isLoading}
            />
            <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <Button 
            type="submit" 
            className="gradient-button h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto sm:px-6 hover:scale-105 transition-transform duration-200 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <DLMETRIXSpinner size="sm" className="mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2 flex-shrink-0" />
            )}
            <span className="truncate">{isLoading ? t.analyzing : t.analyze}</span>
          </Button>
        </form>
        </CardContent>
      </Card>
    </div>
  );
}
