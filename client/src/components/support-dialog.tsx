import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, ExternalLink } from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface SupportDialogProps {
  language?: 'en' | 'es';
}

export default function SupportDialog({ language = 'en' }: SupportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = getTranslations(language);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start md:justify-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 touch-manipulation"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Coffee className="w-4 h-4" />
          <span className="ml-2 md:hidden lg:inline">{t.enjoyingDlmetrix}</span>
          <span className="hidden md:inline lg:hidden ml-2">{t.enjoyingDlmetrix}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-yellow-600" />
            {t.supportTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <p>
            {t.supportDescription}
          </p>
          <div className="flex justify-center">
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => window.open('https://ko-fi.com/dlmetrix', '_blank')}
            >
              <Coffee className="w-4 h-4 mr-2" />
              {t.buyMeCoffee}
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}