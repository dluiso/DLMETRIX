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

  const handleSubmit = (e: React.FormEvent, autoComplete: boolean = false) => {
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

    // Auto-complete with .com if Ctrl+Enter was pressed and no TLD exists
    if (autoComplete && !finalUrl.includes('.') && !finalUrl.startsWith('http')) {
      finalUrl = finalUrl + '.com';
      setUrl(finalUrl); // Update the input field to show the completed URL
    }

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e as any, true); // Pass autoComplete = true
    }
  };

  return (
    <div className="relative mb-6 sm:mb-8">
      <Card className="shadow-elegant bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-fade-in">
        <CardContent className="p-4 sm:p-6">

        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100">
            {language === 'en' ? 'Website URL Analysis' : 'Análisis de URL del Sitio Web'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative min-w-0">
            <Input
              type="text"
              placeholder={language === 'en' ? 'example.com or just "example" + Ctrl+Enter' : 'ejemplo.com o solo "ejemplo" + Ctrl+Enter'}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-4 pr-10 text-sm sm:text-base h-11 sm:h-12 w-full"
              disabled={isLoading}
            />
            <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <Button 
            type="submit" 
            className="gradient-button h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto sm:px-6 hover:scale-105 transition-transform duration-200 font-medium flex-shrink-0"
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
