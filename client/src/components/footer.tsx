import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  return (
    <footer className="w-full border-t bg-background py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <span>© {currentYear} Web Performance Analyzer. All rights reserved. Created by Luis Mena.</span>
            <span className="mx-1">•</span>
            <Dialog open={isLegalOpen} onOpenChange={setIsLegalOpen}>
              <DialogTrigger asChild>
                <button 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
                  onClick={() => setIsLegalOpen(true)}
                >
                  Legal Notice
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Legal Notice
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <p>
                    All rights reserved to Luis Mena Hernandez.
                  </p>
                  <div className="space-y-2">
                    <p className="font-medium">Legal Address:</p>
                    <address className="not-italic text-slate-600 dark:text-slate-400">
                      461 N Lake<br />
                      Aurora, Illinois 60506<br />
                      United States
                    </address>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Application Registration Number:</p>
                    <p className="text-slate-600 dark:text-slate-400 font-mono">
                      EU VAT: EU847629301
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}