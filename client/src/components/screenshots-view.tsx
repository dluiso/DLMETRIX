import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Smartphone, Image, AlertCircle } from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface ScreenshotsViewProps {
  mobileScreenshot: string | null;
  desktopScreenshot: string | null;
  url: string;
  language?: 'en' | 'es';
}

export default function ScreenshotsView({ mobileScreenshot, desktopScreenshot, url, language = 'en' }: ScreenshotsViewProps) {
  const hasScreenshots = mobileScreenshot || desktopScreenshot;
  const t = getTranslations(language);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image className="w-5 h-5 text-primary" />
          <span>Page Screenshots</span>
        </CardTitle>
        <p className="text-sm text-slate-600">
          Visual representation of how your page appears on different devices
        </p>
      </CardHeader>
      <CardContent>
        {!hasScreenshots && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Image className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Screenshots Not Available</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Page screenshots require running browser automation with Puppeteer. 
                  The current analysis provides SEO and meta tag insights only.
                </p>
              </div>
            </div>
          </div>
        )}
        <Tabs defaultValue="mobile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="mobile" className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>{t.mobile}</span>
            </TabsTrigger>
            <TabsTrigger value="desktop" className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>{t.desktop}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mobile" className="space-y-4">
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="text-center mb-4">
                <h4 className="font-medium text-slate-900">Mobile View (375×667)</h4>
                <p className="text-sm text-slate-600">iPhone SE viewport</p>
              </div>
              {mobileScreenshot ? (
                <div className="flex justify-center">
                  <div className="relative max-w-sm">
                    <img
                      src={mobileScreenshot}
                      alt="Mobile screenshot"
                      className="w-full rounded-lg border shadow-lg"
                      style={{ maxHeight: '600px', objectFit: 'cover' }}
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Mobile
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="text-center p-4">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-600 dark:text-amber-400 mb-3" />
                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">{t.screenshotNotAvailable}</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{t.screenshotFailureReason}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="desktop" className="space-y-4">
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="text-center mb-4">
                <h4 className="font-medium text-slate-900">Desktop View (1350×940)</h4>
                <p className="text-sm text-slate-600">Standard desktop viewport</p>
              </div>
              {desktopScreenshot ? (
                <div className="flex justify-center">
                  <div className="relative max-w-4xl">
                    <img
                      src={desktopScreenshot}
                      alt="Desktop screenshot"
                      className="w-full rounded-lg border shadow-lg"
                      style={{ maxHeight: '600px', objectFit: 'cover' }}
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Desktop
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="text-center p-4">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-600 dark:text-amber-400 mb-3" />
                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">{t.screenshotNotAvailable}</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{t.screenshotFailureReason}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Image className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">About Screenshots</h4>
              <p className="text-sm text-blue-700 mt-1">
                Screenshots are captured during the performance analysis to show how your page appears 
                on different devices. They help identify visual issues and layout problems that may affect user experience.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}