import { seoAnalyses, type SeoAnalysis, type InsertSeoAnalysis } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  createSeoAnalysis(analysis: InsertSeoAnalysis): Promise<SeoAnalysis>;
  getSeoAnalysis(id: number): Promise<SeoAnalysis | undefined>;
  getSeoAnalysesByUrl(url: string): Promise<SeoAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private seoAnalyses: Map<number, SeoAnalysis>;
  private currentUserId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.seoAnalyses = new Map();
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

  async createSeoAnalysis(insertAnalysis: InsertSeoAnalysis): Promise<SeoAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: SeoAnalysis = { 
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
      score: insertAnalysis.score ?? 0,
      recommendations: insertAnalysis.recommendations ?? null,
      technicalSeoChecks: insertAnalysis.technicalSeoChecks ?? null,
    };
    this.seoAnalyses.set(id, analysis);
    return analysis;
  }

  async getSeoAnalysis(id: number): Promise<SeoAnalysis | undefined> {
    return this.seoAnalyses.get(id);
  }

  async getSeoAnalysesByUrl(url: string): Promise<SeoAnalysis[]> {
    return Array.from(this.seoAnalyses.values()).filter(
      (analysis) => analysis.url === url,
    );
  }
}

export const storage = new MemStorage();
