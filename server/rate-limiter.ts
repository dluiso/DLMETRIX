interface RateLimitEntry {
  url: string;
  lastAnalyzed: number;
  attempts: number;
}

interface QueueEntry {
  url: string;
  timestamp: number;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

class RateLimiter {
  private rateLimitMap: Map<string, RateLimitEntry> = new Map();
  private activeAnalyses: Set<string> = new Set();
  private analysisQueue: QueueEntry[] = [];
  private readonly RATE_LIMIT_SECONDS = 30;
  private readonly MAX_CONCURRENT_ANALYSES = 20;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Limpiar entradas antiguas cada 5 minutos
    setInterval(() => this.cleanupOldEntries(), this.CLEANUP_INTERVAL);
  }

  private cleanupOldEntries() {
    const now = Date.now();
    const cutoff = now - (this.RATE_LIMIT_SECONDS * 1000 * 2); // Limpiar entradas más antiguas que 2x el rate limit

    for (const [url, entry] of this.rateLimitMap.entries()) {
      if (entry.lastAnalyzed < cutoff) {
        this.rateLimitMap.delete(url);
      }
    }
  }

  private normalizeUrl(url: string): string {
    // Normalizar URL para rate limiting
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch {
      return url.toLowerCase();
    }
  }

  checkRateLimit(url: string): { allowed: boolean; timeRemaining?: number; message?: string } {
    const normalizedUrl = this.normalizeUrl(url);
    const now = Date.now();
    const entry = this.rateLimitMap.get(normalizedUrl);

    if (!entry) {
      return { allowed: true };
    }

    const timeSinceLastAnalysis = now - entry.lastAnalyzed;
    const rateLimitMs = this.RATE_LIMIT_SECONDS * 1000;

    if (timeSinceLastAnalysis < rateLimitMs) {
      const timeRemaining = Math.ceil((rateLimitMs - timeSinceLastAnalysis) / 1000);
      return {
        allowed: false,
        timeRemaining,
        message: `Debe esperar ${timeRemaining} segundos antes de analizar esta URL nuevamente por motivos de seguridad.`
      };
    }

    return { allowed: true };
  }

  updateRateLimit(url: string) {
    const normalizedUrl = this.normalizeUrl(url);
    const now = Date.now();
    
    const entry = this.rateLimitMap.get(normalizedUrl);
    if (entry) {
      entry.lastAnalyzed = now;
      entry.attempts += 1;
    } else {
      this.rateLimitMap.set(normalizedUrl, {
        url: normalizedUrl,
        lastAnalyzed: now,
        attempts: 1
      });
    }
  }

  async queueAnalysis<T>(url: string, analysisFunction: () => Promise<T>): Promise<T> {
    const normalizedUrl = this.normalizeUrl(url);

    // Verificar rate limit
    const rateLimitCheck = this.checkRateLimit(url);
    if (!rateLimitCheck.allowed) {
      throw new Error(JSON.stringify({
        type: 'RATE_LIMIT_ERROR',
        message: rateLimitCheck.message,
        timeRemaining: rateLimitCheck.timeRemaining
      }));
    }

    // Si hay espacio para análisis concurrente, ejecutar inmediatamente
    if (this.activeAnalyses.size < this.MAX_CONCURRENT_ANALYSES) {
      return this.executeAnalysis(normalizedUrl, analysisFunction);
    }

    // Si no hay espacio, agregar a la cola
    return new Promise<T>((resolve, reject) => {
      const queueEntry: QueueEntry = {
        url: normalizedUrl,
        timestamp: Date.now(),
        resolve: async () => {
          try {
            const result = await this.executeAnalysis(normalizedUrl, analysisFunction);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        reject
      };

      this.analysisQueue.push(queueEntry);
      
      // Notificar posición en cola
      const queuePosition = this.analysisQueue.length;
      if (queuePosition > 1) {
        console.log(`[QUEUE] URL ${url} added to queue at position ${queuePosition}`);
      }
    });
  }

  private async executeAnalysis<T>(normalizedUrl: string, analysisFunction: () => Promise<T>): Promise<T> {
    this.activeAnalyses.add(normalizedUrl);
    
    try {
      // Actualizar rate limit antes de ejecutar
      this.updateRateLimit(normalizedUrl);
      
      const result = await analysisFunction();
      
      return result;
    } finally {
      this.activeAnalyses.delete(normalizedUrl);
      
      // Procesar el siguiente elemento de la cola
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.analysisQueue.length === 0) return;
    if (this.activeAnalyses.size >= this.MAX_CONCURRENT_ANALYSES) return;

    const nextEntry = this.analysisQueue.shift();
    if (nextEntry) {
      console.log(`[QUEUE] Processing queued analysis for ${nextEntry.url}`);
      nextEntry.resolve();
    }
  }

  getQueueStatus() {
    return {
      activeAnalyses: this.activeAnalyses.size,
      queueLength: this.analysisQueue.length,
      maxConcurrent: this.MAX_CONCURRENT_ANALYSES,
      rateLimitSeconds: this.RATE_LIMIT_SECONDS
    };
  }

  getQueuePosition(url: string): number {
    const normalizedUrl = this.normalizeUrl(url);
    const position = this.analysisQueue.findIndex(entry => entry.url === normalizedUrl);
    return position === -1 ? 0 : position + 1;
  }
}

export const rateLimiter = new RateLimiter();