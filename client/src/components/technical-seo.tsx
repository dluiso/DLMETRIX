import { Card, CardContent } from "@/components/ui/card";
import { Settings, Check, X, AlertTriangle } from "lucide-react";

interface TechnicalSeoProps {
  checks: Record<string, boolean>;
}

export default function TechnicalSeo({ checks }: TechnicalSeoProps) {
  const getCheckIcon = (status: boolean) => {
    return status ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-red-600" />
    );
  };

  const formatCheckName = (key: string) => {
    const names: Record<string, string> = {
      canonicalUrl: 'Canonical URL',
      robotsMeta: 'Robots Meta Tag',
      viewportMeta: 'Viewport Meta Tag',
      schemaMarkup: 'Schema Markup',
      sitemap: 'Sitemap',
    };
    return names[key] || key;
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-primary flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">Technical SEO</h3>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          {Object.entries(checks).map(([key, status]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-xs sm:text-sm text-slate-600 pr-2">{formatCheckName(key)}</span>
              {getCheckIcon(status)}
            </div>
          ))}
          
          {Object.keys(checks).length === 0 && (
            <div className="text-center py-4 text-slate-500">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
              <p className="text-xs sm:text-sm">No technical SEO data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
