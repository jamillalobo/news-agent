import { GoogleGenerativeAI } from "@google/generative-ai";
import config from '../config/config';

export class EmbeddingService {
  private genAI: GoogleGenerativeAI;
  private model: any; 

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: config.EMBEDDING_MODEL });
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.model.embedContent(text);
      const embedding = result.embedding.values;
      return embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw new Error('Failed to get embedding');
    }
  }
}