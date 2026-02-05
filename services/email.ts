
import { GoogleGenAI } from "@google/genai";
import { Project, Department, User } from '../types';

const RECIPIENT_EMAIL = 'maramawitdereje93@gmail.com';

export const EmailService = {
  generateMonthlyReport: async (projects: Project[], departments: Department[], users: User[]) => {
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
    
    // Aggregate data for the prompt
    const totalApproved = projects.reduce((sum, p) => sum + p.approvedBudget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spentBudget, 0);
    const activeProjects = projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'REJECTED').length;
    
    const prompt = `
      You are a Senior Financial Auditor. Generate a professional, executive monthly financial report email.
      
      Recipient: ${RECIPIENT_EMAIL}
      
      Data Summary:
      - Total Approved Budget: $${totalApproved.toLocaleString()}
      - Total Liquidated Funds: $${totalSpent.toLocaleString()}
      - Utilization Rate: ${totalApproved > 0 ? ((totalSpent/totalApproved)*100).toFixed(2) : 0}%
      - Active Portfolios: ${activeProjects}
      - Departments: ${departments.map(d => d.name).join(', ')}
      
      Please include:
      1. A professional greeting.
      2. A high-level executive summary.
      3. Critical observations (e.g., if utilization is high).
      4. A concluding statement regarding institutional integrity.
      
      Format the output as a clean, professional email body.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Gemini Report Generation Error:', error);
      return null;
    }
  },

  dispatchReport: async (content: string) => {
    // In a real-world scenario, this would call an API like SendGrid or AWS SES.
    // For this institutional hub, we simulate the dispatch and provide a mailto backup.
    console.log(`[SYSTEM DISPATCH] Sending report to: ${RECIPIENT_EMAIL}`);
    console.log('Report Content:', content);
    
    // Simulate network latency for the secure dispatch
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  },

  getRecipient: () => RECIPIENT_EMAIL
};
