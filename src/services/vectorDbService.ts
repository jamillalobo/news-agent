import { Pool } from 'pg';

import { Article } from '../models/article';
import config from '../config/config';

export class VectorDbService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.PG_CONNECTION_STRING,
    });

    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      const extensionExists = await this.pool.query(
        "SELECT 1 FROM pg_extension WHERE extname = 'vector'"
      );
      
      if (extensionExists.rows.length === 0) {
        await this.pool.query('CREATE EXTENSION IF NOT EXISTS vector');
      }
  
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS articles (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          url TEXT NOT NULL UNIQUE,
          date TIMESTAMP NOT NULL,
          embedding vector(1536)
        )
      `);
      
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS articles_embedding_idx ON articles USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async saveArticle(article: Article): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO articles (title, content, url, date, embedding)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (url) DO UPDATE
         SET title = EXCLUDED.title, content = EXCLUDED.content, date = EXCLUDED.date, embedding = EXCLUDED.embedding`,
        [article.title, article.content, article.url, article.date, article.embedding]
      );
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  }

  async findSimilarArticles(embedding: number[], limit: number = 3): Promise<Article[]> {
    try {
      const result = await this.pool.query(
        `SELECT title, content, url, date
         FROM articles
         ORDER BY embedding <=> $1
         LIMIT $2`,
        [embedding, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error finding similar articles:', error);
      throw error;
    }
  }

  async getArticleByUrl(url: string): Promise<Article | null> {
    try {
      const result = await this.pool.query(
        `SELECT title, content, url, date
         FROM articles
         WHERE url = $1`,
        [url]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting article by URL:', error);
      throw error;
    }
  }
}