import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Coffee, ExternalLink } from "lucide-react";

export default function WhyDlmetrixDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Why DLMETRIX</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Why DLMETRIX
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <p>
            DLMETRIX was born from the need to provide a powerful and accessible SEO metrics tool—without the high costs often associated with similar platforms. While many competitors limit essential features behind paywalls, DLMETRIX offers real-time, high-quality web analytics that anyone can use for free.
          </p>
          
          <p>
            Our mission is to democratize SEO and performance analysis by delivering cutting-edge diagnostic tools built with the latest web technologies. With DLMETRIX, users can gain instant insights into their site's Core Web Vitals, technical SEO, mobile readiness, social media previews, and keyword trends—all with the support of AI-driven content analysis and actionable recommendations.
          </p>
          
          <p>
            Whether you're a developer, marketer, freelancer, or business owner, DLMETRIX empowers you to optimize your online presence with ease, clarity, and transparency. No barriers. No hidden fees. Just smart, reliable metrics—ready when you are.
          </p>
          
          <div className="border-t pt-4 mt-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              Enjoying DLMETRIX?
            </h3>
            <p className="mb-4">
              If you'd like to support this project, consider buying me a coffee ☕—your contribution helps keep the platform free and growing!
            </p>
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