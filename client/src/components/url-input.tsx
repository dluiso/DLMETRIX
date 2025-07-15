import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Link, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTranslations } from "@/lib/translations";

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  language?: 'en' | 'es';
}

export default function UrlInput({ onAnalyze, isLoading, language = 'en' }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();
  const t = getTranslations(language);

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
    <Card className="mb-6 sm:mb-8 shadow-elegant bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-fade-in">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-5 h-5 text-primary flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
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
              className="pl-4 pr-10 text-sm sm:text-base h-10 sm:h-11"
              disabled={isLoading}
            />
            <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <Button 
            type="submit" 
            className="gradient-button h-10 sm:h-11 text-sm sm:text-base w-full sm:w-auto sm:px-6 hover:scale-105 transition-transform duration-200"
            disabled={isLoading}
          >
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? t.analyzing : t.analyze}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
