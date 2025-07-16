import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Coffee, ExternalLink } from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface WhyDlmetrixDialogProps {
  language?: 'en' | 'es';
}

export default function WhyDlmetrixDialog({ language = 'en' }: WhyDlmetrixDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = getTranslations(language);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">{t.whyDlmetrix}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Info className="w-5 h-5" />
            {t.whyDlmetrixTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <p>
            {t.whyDlmetrixContent1}
          </p>
          
          <p>
            {t.whyDlmetrixContent2}
          </p>
          
          <p>
            {t.whyDlmetrixContent3}
          </p>
          
          <div className="border-t pt-4 mt-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              {t.supportProjectTitle}
            </h3>
            <p className="mb-4">
              {t.supportProjectDescription}
            </p>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => window.open('https://www.paypal.com/paypalme/dluiso', '_blank')}
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