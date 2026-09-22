import { Request, Response } from 'express';
import { ragQuery } from '../../../lib/rag-orchestrator';
import { prisma } from '../../../lib/prisma';

export async function autoMapPolicy(req: Request, res: Response) {
  try {
    const { regulatorySnippet, lawId } = req.body;

    // Use RAG to suggest internal control mappings
    const prompt = `Based on the following regulatory snippet, suggest 3 relevant internal compliance controls. 
    Format the response as JSON: { "suggestedControls": [{ "title": string, "description": string, "severity": string }] }.
    Snippet: ${regulatorySnippet}`;

    const suggestion = await ragQuery(prompt, 'org_enterprise_default');
    
    // Parse suggestion (assuming JSON response from RAG)
    const parsedSuggestion = JSON.parse(suggestion);

    res.json(parsedSuggestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate mapping suggestions' });
  }
}
