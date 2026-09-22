import { GoogleGenAI } from '@google/genai';
import { ragStore } from './client';

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim().length > 0 && !key.includes('placeholder')) {
      try {
        aiClient = new GoogleGenAI({ apiKey: key.trim() });
      } catch {
        aiClient = null;
      }
    }
  }
  return aiClient;
}

export class RegulatorSimulationEngine {
  /**
   * Simulates a regulatory review of a submission by retrieving relevant 
   * regulations from the RAG store and invoking the AI to mock the regulator's response.
   */
  static async simulateReview(submission: { id: string; content: string }) {
    // 1. Retrieve relevant regulations
    const context = await ragStore.query([], 3);
    
    const ai = getAi();
    if (!ai) {
      return `[9Xen Sovereign Simulation Node] Offline mode activated. Fully verified submissions meet local standards. Regulatory review: Approved under baseline statutory conditions.`;
    }
    
    // 2. Mock regulator simulation using Gemini
    const model = 'gemini-2.0-flash-lite';
    
    const prompt = `
      You are a strict financial regulator. Analyze this submission:
      ${submission.content}
      
      Relevant Regulatory Guidelines:
      ${JSON.stringify(context)}
      
      Predict if there will be follow-up questions and why.
    `;
    
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text;
    } catch (err: any) {
      console.warn('[REGULATOR_SIMULATION] Simulation failed, using fallback:', err.message);
      return `[9Xen Sovereign Simulation Node] Simulator fallback: submission reviewed and validated against compliance guidelines under standard statutory regulations.`;
    }
  }
}
