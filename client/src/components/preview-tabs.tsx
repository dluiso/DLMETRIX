import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SeoAnalysisResult } from "@/types/seo";
import { Image } from "lucide-react";

interface PreviewTabsProps {
  data: SeoAnalysisResult;
}

export default function PreviewTabs({ data }: PreviewTabsProps) {
  const getGoogleTitle = () => data.title || 'No title specified';
  const getGoogleDescription = () => data.description || 'No description specified';
  const getGoogleUrl = () => {
    try {
      const url = new URL(data.url);
      return url.hostname;
    } catch {
      return data.url;
    }
  };

  const getFacebookTitle = () => data.openGraphTags?.['og:title'] || data.title || 'No title specified';
  const getFacebookDescription = () => {
    const ogDesc = data.openGraphTags?.['og:description'] || data.description || 'No description specified';
    return ogDesc.length > 60 ? ogDesc.substring(0, 60) + '...' : ogDesc;
  };
  const getFacebookUrl = () => {
    try {
      const url = new URL(data.url);
      return url.hostname;
    } catch {
      return data.url;
    }
  };

  const getTwitterTitle = () => data.twitterCardTags?.['twitter:title'] || data.title || 'No title specified';
  const getTwitterDescription = () => {
    const twitterDesc = data.twitterCardTags?.['twitter:description'] || data.description || 'No description specified';
    return twitterDesc;
  };
  const getTwitterUrl = () => {
    try {
      const url = new URL(data.url);
      return url.hostname;
    } catch {
      return data.url;
    }
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 overflow-x-auto">
            <TabsTrigger value="google" className="text-xs sm:text-sm p-2 sm:p-3 min-h-[44px] data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-4 h-4 text-current flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <span className="hidden sm:inline">Google</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="facebook" className="text-xs sm:text-sm p-2 sm:p-3 min-h-[44px] data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-4 h-4 text-current flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                  </svg>
                </div>
                <span className="hidden sm:inline">Facebook</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="twitter" className="text-xs sm:text-sm p-2 sm:p-3 min-h-[44px] data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-4 h-4 text-current flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="hidden sm:inline">X</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="google" className="mt-4">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
              <div className="text-xs sm:text-sm text-slate-600 mb-1 truncate">{getGoogleUrl()}</div>
              <div className="text-sm sm:text-lg text-blue-600 hover:underline cursor-pointer mb-1 line-clamp-2">
                {getGoogleTitle()}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                {getGoogleDescription()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="facebook" className="mt-4">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <div className="h-32 sm:h-40 bg-slate-100 flex items-center justify-center text-slate-500 relative">
                  {data.openGraphTags?.['og:image'] ? (
                    <img 
                      src={data.openGraphTags['og:image']} 
                      alt="Facebook preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-center"><svg class="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v12H4z"/><path d="M9 9h6v6H9z"/></svg><div class="text-xs sm:text-sm">Image failed to load</div></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                      <div className="text-xs sm:text-sm">No OG image specified</div>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="font-medium text-slate-900 mb-1 text-sm sm:text-base line-clamp-2">
                    {getFacebookTitle()}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">
                    {getFacebookDescription()}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{getFacebookUrl()}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="mt-4">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
              <div className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden bg-white">
                <div className="h-36 sm:h-48 bg-slate-100 flex items-center justify-center text-slate-500 relative">
                  {data.twitterCardTags?.['twitter:image'] ? (
                    <img 
                      src={data.twitterCardTags['twitter:image']} 
                      alt="X preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-center"><svg class="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v12H4z"/><path d="M9 9h6v6H9z"/></svg><div class="text-xs sm:text-sm">Image failed to load</div></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                      <div className="text-xs sm:text-sm">No X image specified</div>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="font-medium text-slate-900 mb-1 text-sm sm:text-base line-clamp-2">
                    {getTwitterTitle()}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">
                    {getTwitterDescription()}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{getTwitterUrl()}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}