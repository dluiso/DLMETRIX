import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTranslations } from "@/lib/translations";

interface ContactDialogProps {
  language?: 'en' | 'es';
}

export default function ContactDialog({ language = 'en' }: ContactDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const t = getTranslations(language);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('support@dlmetrix.com');
      setCopied(true);
      toast({
        title: t.emailCopied,
        description: t.emailCopiedDescription,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: t.copyFailed,
        description: t.copyFailedDescription,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">{t.contact}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t.contactTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <p>
            {t.contactDescription}
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">{t.emailSupport}</p>
                <p className="text-slate-600 dark:text-slate-400 font-mono">support@dlmetrix.com</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleCopyEmail}
                className="ml-2"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.responseTime}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}