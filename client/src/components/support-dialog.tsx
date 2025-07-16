import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, ExternalLink } from "lucide-react";

export default function SupportDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300">
          <Coffee className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Enjoying DLMETRIX?</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-yellow-600" />
            Support DLMETRIX
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <p>
            If you'd like to support this project, consider buying me a coffee ☕—your contribution helps keep the platform free and growing!
          </p>
          <div className="flex justify-center">
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => window.open('https://www.paypal.com/paypalme/dluiso', '_blank')}
            >
              <Coffee className="w-4 h-4 mr-2" />
              Buy me a coffee
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}