import { webAnalyses, type WebAnalysis, type InsertWebAnalysis } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  createWebAnalysis(analysis: InsertWebAnalysis): Promise<WebAnalysis>;
  getWebAnalysis(id: number): Promise<WebAnalysis | undefined>;
  getWebAnalysesByUrl(url: string): Promise<WebAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private webAnalyses: Map<number, WebAnalysis>;
  private currentUserId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.webAnalyses = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createWebAnalysis(insertAnalysis: InsertWebAnalysis): Promise<WebAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: WebAnalysis = { 
      id,
      url: insertAnalysis.url,
      title: insertAnalysis.title ?? null,
      description: insertAnalysis.description ?? null,
      keywords: insertAnalysis.keywords ?? null,
      canonicalUrl: insertAnalysis.canonicalUrl ?? null,
      robotsMeta: insertAnalysis.robotsMeta ?? null,
      viewportMeta: insertAnalysis.viewportMeta ?? null,
      openGraphTags: insertAnalysis.openGraphTags ?? null,
      twitterCardTags: insertAnalysis.twitterCardTags ?? null,
      schemaMarkup: insertAnalysis.schemaMarkup ?? false,
      sitemap: insertAnalysis.sitemap ?? false,
      coreWebVitals: insertAnalysis.coreWebVitals ?? null,
      performanceScore: insertAnalysis.performanceScore ?? 0,
      accessibilityScore: insertAnalysis.accessibilityScore ?? 0,
      bestPracticesScore: insertAnalysis.bestPracticesScore ?? 0,
      seoScore: insertAnalysis.seoScore ?? 0,
      mobileScreenshot: insertAnalysis.mobileScreenshot ?? null,
      desktopScreenshot: insertAnalysis.desktopScreenshot ?? null,
      recommendations: insertAnalysis.recommendations ?? null,
      diagnostics: insertAnalysis.diagnostics ?? null,
      insights: insertAnalysis.insights ?? null,
      technicalChecks: insertAnalysis.technicalChecks ?? null,
    };
    this.webAnalyses.set(id, analysis);
    return analysis;
  }

  async getWebAnalysis(id: number): Promise<WebAnalysis | undefined> {
    return this.webAnalyses.get(id);
  }

  async getWebAnalysesByUrl(url: string): Promise<WebAnalysis[]> {
    return Array.from(this.webAnalyses.values()).filter(
      (analysis) => analysis.url === url,
    );
  }
}

export const storage = new MemStorage();
