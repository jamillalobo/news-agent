import axios from 'axios';
import config from '../config/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any; 

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: config.GEMINI_MODEL }); 
  }

  async generateCompletion(prompt: string, context: string = ''): Promise<string> {
    try {
      const formattedPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;
      const result = await this.model.generateContent(formattedPrompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('Error generating completion:', error);
      throw new Error('Failed to generate completion');
    }
  }

  async extractArticleContent(html: string, url: string): Promise<{ title: string; content: string }> {
    try {
      const prompt = `
        Extract the main content from this news article HTML. Return only a JSON object with "title" and "content" fields.
        URL: ${url}
        HTML: ${html.substring(0, 10000)}... [truncated if too long]
      `;

      const response = await this.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error extracting article content:', error);
      throw new Error('Failed to extract article content');
    }
  }
}