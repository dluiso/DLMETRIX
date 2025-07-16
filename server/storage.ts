import { webAnalyses, sharedReports, type WebAnalysis, type InsertWebAnalysis, type SharedReport, type InsertSharedReport } from "@shared/schema";
import { getDatabase } from "./db";
import { eq, lt } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  createWebAnalysis(analysis: InsertWebAnalysis): Promise<WebAnalysis>;
  getWebAnalysis(id: number): Promise<WebAnalysis | undefined>;
  getWebAnalysesByUrl(url: string): Promise<WebAnalysis[]>;
  createSharedReport(report: InsertSharedReport): Promise<SharedReport>;
  getSharedReport(shareToken: string): Promise<SharedReport | undefined>;
  cleanExpiredSharedReports(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private webAnalyses: Map<number, WebAnalysis>;
  private sharedReports: Map<string, SharedReport>;
  private currentUserId: number;
  private currentAnalysisId: number;
  private currentSharedId: number;

  constructor() {
    this.users = new Map();
    this.webAnalyses = new Map();
    this.sharedReports = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
    this.currentSharedId = 1;
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

  async createSharedReport(insertReport: InsertSharedReport): Promise<SharedReport> {
    const report: SharedReport = {
      id: this.currentSharedId++,
      ...insertReport,
      createdAt: new Date(),
    };
    this.sharedReports.set(report.shareToken, report);
    return report;
  }

  async getSharedReport(shareToken: string): Promise<SharedReport | undefined> {
    const report = this.sharedReports.get(shareToken);
    if (report && report.expiresAt > new Date()) {
      return report;
    }
    if (report && report.expiresAt <= new Date()) {
      this.sharedReports.delete(shareToken);
    }
    return undefined;
  }

  async cleanExpiredSharedReports(): Promise<void> {
    const now = new Date();
    const tokensToDelete: string[] = [];
    
    this.sharedReports.forEach((report, token) => {
      if (report.expiresAt <= now) {
        tokensToDelete.push(token);
      }
    });
    
    tokensToDelete.forEach(token => {
      this.sharedReports.delete(token);
    });
  }
}

// DatabaseStorage implementation for MySQL
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<any | undefined> {
    // User functionality not needed for shared reports
    return undefined;
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    // User functionality not needed for shared reports
    return undefined;
  }

  async createUser(user: any): Promise<any> {
    // User functionality not needed for shared reports
    return user;
  }

  async createWebAnalysis(insertAnalysis: InsertWebAnalysis): Promise<WebAnalysis> {
    const { db } = await getDatabase();
    
    if (!db) {
      console.error('❌ Database not available for web analysis storage');
      // Fallback to memory storage for critical functionality
      const memStorage = new MemStorage();
      return await memStorage.createWebAnalysis(insertAnalysis);
    }
    const [result] = await db.insert(webAnalyses).values(insertAnalysis).execute();
    return { id: result.insertId as number, ...insertAnalysis } as WebAnalysis;
  }

  async getWebAnalysis(id: number): Promise<WebAnalysis | undefined> {
    const { db } = await getDatabase();
    if (!db) return undefined;
    const [analysis] = await db.select().from(webAnalyses).where(eq(webAnalyses.id, id));
    return analysis || undefined;
  }

  async getWebAnalysesByUrl(url: string): Promise<WebAnalysis[]> {
    const { db } = await getDatabase();
    if (!db) return [];
    return await db.select().from(webAnalyses).where(eq(webAnalyses.url, url));
  }

  async createSharedReport(insertReport: InsertSharedReport): Promise<SharedReport> {
    const { db } = await getDatabase();
    
    if (!db) {
      console.error('❌ Database not available for shared reports, using memory fallback');
      // Fallback to memory storage for shared reports
      const memStorage = new MemStorage();
      return await memStorage.createSharedReport(insertReport);
    }
    
    console.log(`💾 Saving shared report to database with token: ${insertReport.shareToken}`);
    
    const [result] = await db.insert(sharedReports).values({
      ...insertReport,
      createdAt: new Date()
    }).execute();
    
    const report: SharedReport = {
      id: result.insertId as number,
      ...insertReport,
      createdAt: new Date()
    };
    
    console.log(`✅ Shared report saved to database with ID: ${report.id}`);
    return report;
  }

  async getSharedReport(shareToken: string): Promise<SharedReport | undefined> {
    const { db } = await getDatabase();
    
    if (!db) {
      console.log(`⚠️ Database not available, checking memory fallback for token: ${shareToken}`);
      // Try memory storage as fallback
      const memStorage = new MemStorage();
      return await memStorage.getSharedReport(shareToken);
    }
    
    console.log(`🔍 Searching for shared report with token: ${shareToken}`);
    
    const [report] = await db.select().from(sharedReports)
      .where(eq(sharedReports.shareToken, shareToken));
    
    if (report) {
      console.log(`📄 Found shared report: ${report.url} (expires: ${report.expiresAt})`);
      
      // Check if expired
      if (report.expiresAt <= new Date()) {
        console.log(`⏰ Report expired, deleting...`);
        await db.delete(sharedReports).where(eq(sharedReports.shareToken, shareToken));
        return undefined;
      }
      
      return report;
    }
    
    console.log(`❌ No shared report found with token: ${shareToken}`);
    return undefined;
  }

  async cleanExpiredSharedReports(): Promise<void> {
    const { db } = await getDatabase();
    if (!db) return;
    const now = new Date();
    await db.delete(sharedReports).where(lt(sharedReports.expiresAt, now));
    console.log(`🧹 Cleaned expired shared reports`);
  }
}

// Use MemStorage for development, DatabaseStorage for production
export const storage = process.env.NODE_ENV === 'production' ? new DatabaseStorage() : new MemStorage();
