import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateContent(prompt: string): Promise<string> {
  if (!ai) return 'Gemini API Key is not configured.';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error('Error generating content:', error);
    return 'Failed to generate content from AI.';
  }
}

export async function generateAiContent(prompt: string): Promise<string> {
  return generateContent(prompt);
}

export async function askKnowledgeBot(prompt: string, context?: any): Promise<string> {
  return generateContent(prompt);
}
