import { parse } from "csv-parse"; 
import fs from 'fs';
import { Article } from '../models/article';
import { VectorDbService } from '../services/vectorDbService'; 
import { EmbeddingService } from '../services/embeddingService'; 
import { ScraperService } from "@services/scraperService";

interface CsvRow {
  Source: string;
  URL: string;
}

export class CsvProcessor {
  constructor(
    private scraperService: ScraperService,
    private vectorDbService: VectorDbService,
    private embeddingService: EmbeddingService
  ) {}

  async processCsv(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const parser = parse({
        columns: true,
        skip_empty_lines: true
      });

      fs.createReadStream(filePath)
        .pipe(parser)
        .on('data', async (row: CsvRow) => {
          try {
            console.log(`Processing article from ${row.Source}: ${row.URL}`);
            
            const { title, content } = await this.scraperService.scrapeAndProcessArticle(row.URL);
            const embedding = await this.embeddingService.getEmbedding(`${title}\n${content}`);
            
            await this.vectorDbService.saveArticle({
              title,
              content,
              url: row.URL,
              date: new Date().toISOString(),
              embedding
            });
            
            console.log(`Successfully processed: ${title}`);
          } catch (error) {
            console.error(`Error processing ${row.URL}:`, error);
          }
        })
        .on('end', () => {
          console.log('CSV processing completed');
          resolve();
        })
        .on('error', (error) => {
          console.error('CSV processing failed:', error);
          reject(error);
        });
    });
  }
}