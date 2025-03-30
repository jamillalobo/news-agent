import { Request, Response } from 'express';
import { AgentRequest, AgentResponse } from '../models/article';
import { EmbeddingService } from '../services/embeddingService';
import { VectorDbService } from '../services/vectorDbService';

import { GeminiService } from '../services/geminiService';
import { ScraperService } from '../services/scraperService';

export class AgentController {
  private embeddingService: EmbeddingService;
  private vectorDbService: VectorDbService;
  private geminiService: GeminiService;
  private scraperService: ScraperService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.vectorDbService = new VectorDbService();
    this.geminiService = new GeminiService();
    this.scraperService = new ScraperService();
  }

  private extractUrlFromQuery(query: string): string | null {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = query.match(urlRegex);
    return matches ? matches[0] : null;
  }

  async handleAgentRequest(req: Request, res: Response) {
    try {
      const request: AgentRequest = req.body;
      const url = this.extractUrlFromQuery(request.query);

      let answer: string;
      let sources: {title: string, url: string, date: string}[] = [];

      if (url) {
        const article = await this.vectorDbService.getArticleByUrl(url) || 
                        await this.processNewArticle(url);
        
        if (article) {
          answer = await this.geminiService.generateCompletion(
            `Summarize this article: ${request.query}`,
            article.content
          );
          sources = [{
            title: article.title,
            url: article.url,
            date: article.date
          }];
        } else {
          answer = "Sorry, I couldn't retrieve that article.";
        }
      } else {
        const embedding = await this.embeddingService.getEmbedding(request.query);
        const similarArticles = await this.vectorDbService.findSimilarArticles(embedding);
        
        const context = similarArticles
          .map(a => `Title: ${a.title}\nContent: ${a.content.substring(0, 500)}...`)
          .join('\n\n');
        
        answer = await this.geminiService.generateCompletion(request.query, context);
        sources = similarArticles.map(a => ({
          title: a.title,
          url: a.url,
          date: a.date
        }));
      }

      const response: AgentResponse = {
        answer,
        sources
      };

      res.json(response);
    } catch (error) {
      console.error('Error in agent request:', error);
      res.status(500).json({
        answer: "Sorry, I encountered an error processing your request.",
        sources: []
      });
    }
  }

  private async processNewArticle(url: string) {
    try {
      const { title, content } = await this.scraperService.scrapeAndProcessArticle(url);
      const embedding = await this.embeddingService.getEmbedding(`${title}\n${content}`);
      
      const article = {
        title,
        content,
        url,
        date: new Date().toISOString(),
        embedding
      };
      
      await this.vectorDbService.saveArticle(article);
      return article;
    } catch (error) {
      console.error('Error processing new article:', error);
      return null;
    }
  }
}