import { HtmlReportGenerator, WebAnalysisData } from './html-report-generator';
import { nanoid } from 'nanoid';

export class TempShareService {
  private htmlGenerator: HtmlReportGenerator;

  constructor() {
    this.htmlGenerator = new HtmlReportGenerator();
  }

  /**
   * Creates a temporary shareable report and returns the token
   */
  async createSharedReport(analysisData: WebAnalysisData): Promise<string> {
    try {
      console.log('📄 Creating temporary HTML report...');
      const token = await this.htmlGenerator.generateSharedReport(analysisData);
      console.log(`✅ HTML report created with token: ${token}`);
      return token;
    } catch (error) {
      console.error('❌ Error creating shared report:', error);
      throw error;
    }
  }

  /**
   * Retrieves a shared report by token
   */
  getSharedReport(token: string): string | null {
    try {
      console.log(`🔍 Retrieving shared report: ${token}`);
      const htmlContent = this.htmlGenerator.getSharedReport(token);
      
      if (!htmlContent) {
        console.log(`❌ Report not found or expired: ${token}`);
        return null;
      }

      console.log(`✅ Report retrieved successfully: ${token}`);
      return htmlContent;
    } catch (error) {
      console.error('❌ Error retrieving shared report:', error);
      return null;
    }
  }

  /**
   * Validates if a token exists and is not expired
   */
  validateToken(token: string): boolean {
    const htmlContent = this.htmlGenerator.getSharedReport(token);
    return htmlContent !== null;
  }
}

// Export singleton instance
export const tempShareService = new TempShareService();