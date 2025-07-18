import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ExternalLink, Globe, Link, Users, TrendingUp, Shield, Clock } from "lucide-react";
import { getTranslations } from "@/lib/translations";
import type { OffPageData } from "@shared/schema";

interface OffPageAnalysisProps {
  data: OffPageData | null;
  language?: 'en' | 'es';
}

export default function OffPageAnalysis({ data, language = 'en' }: OffPageAnalysisProps) {
  const t = getTranslations(language);

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            {t.offPageAnalysis.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            {t.offPageAnalysis.notAvailable}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { backlinks, domainAuthority, wikipediaBacklinks, socialPresence, trustMetrics } = data;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          {t.offPageAnalysis.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Domain Authority Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t.offPageAnalysis.domainAuthority}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.offPageAnalysis.authorityScore}
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {domainAuthority.score}/100
                  </span>
                </div>
                <Progress value={domainAuthority.score} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t.offPageAnalysis.pageRank}</span>
                    <span className="font-semibold">{domainAuthority.pageRank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.offPageAnalysis.trustRank}</span>
                    <span className="font-semibold">{domainAuthority.trustRank}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backlinks Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="w-4 h-4" />
                {t.offPageAnalysis.backlinks}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.offPageAnalysis.totalBacklinks}
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {backlinks.totalLinks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.offPageAnalysis.referringDomains}
                  </span>
                  <span className="text-lg font-semibold text-purple-600">
                    {backlinks.referringDomains}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t.offPageAnalysis.dofollow}</span>
                    <span className="font-semibold">{backlinks.linkTypes.dofollow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.offPageAnalysis.nofollow}</span>
                    <span className="font-semibold">{backlinks.linkTypes.nofollow}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wikipedia Backlinks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t.offPageAnalysis.wikipediaBacklinks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                {wikipediaBacklinks.isReferenced ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm">
                  {wikipediaBacklinks.isReferenced 
                    ? t.offPageAnalysis.hasWikipediaReferences
                    : t.offPageAnalysis.noWikipediaReferences
                  }
                </span>
              </div>
              <Badge variant="outline">
                {wikipediaBacklinks.totalWikipediaLinks} {t.offPageAnalysis.links}
              </Badge>
            </div>
            
            {wikipediaBacklinks.wikipediaPages.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t.offPageAnalysis.wikipediaPages}</h4>
                <div className="space-y-1">
                  {wikipediaBacklinks.wikipediaPages.slice(0, 3).map((page, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="truncate">{page.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {page.language}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {page.linkType}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {wikipediaBacklinks.wikipediaPages.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{wikipediaBacklinks.wikipediaPages.length - 3} {t.offPageAnalysis.more}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Referrers */}
        {backlinks.topReferrers.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t.offPageAnalysis.topReferrers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backlinks.topReferrers.slice(0, 5).map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{referrer.domain}</div>
                      <div className="text-xs text-gray-500">
                        {referrer.linkCount} {t.offPageAnalysis.links} • {t.offPageAnalysis.trust}: {referrer.trustScore}/100
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{referrer.linkCount}</div>
                      <div className="text-xs text-gray-500">{t.offPageAnalysis.links}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Presence */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              Social Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{socialPresence.mentions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Mentions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{socialPresence.shareCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Share Count</div>
              </div>
            </div>
            <div className="space-y-2">
              {socialPresence.platforms.map((platform, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{platform.platform}</span>
                  <div className="flex items-center gap-2">
                    <span>{platform.mentions} mentions</span>
                    <span className="text-gray-500">•</span>
                    <span>{platform.engagement} engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trust Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t.offPageAnalysis.trustMetrics}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {trustMetrics.httpsEnabled ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">{t.offPageAnalysis.httpsEnabled}</span>
                </div>
                <div className="flex items-center gap-2">
                  {trustMetrics.certificateValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">{t.offPageAnalysis.certificateValid}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">
                    {t.offPageAnalysis.domainAge}: {Math.round(trustMetrics.domainAge / 365)} {t.offPageAnalysis.years}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t.offPageAnalysis.spamScore}
                </span>
                <span className="text-lg font-semibold text-orange-600">
                  {trustMetrics.spamScore}/100
                </span>
              </div>
              
              {trustMetrics.trustSignals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{t.offPageAnalysis.trustSignals}</h4>
                  <div className="flex flex-wrap gap-1">
                    {trustMetrics.trustSignals.map((signal, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {signal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


      </CardContent>
    </Card>
  );
}