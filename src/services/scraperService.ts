import axios from 'axios';
import cheerio from 'cheerio';
import { GeminiService } from './geminiService';

export class ScraperService {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async scrapeAndProcessArticle(url: string): Promise<{ title: string; content: string }> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.google.com/'
        },
        timeout: 30000,
        maxRedirects: 5
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const $ = cheerio.load(response.data);

      $('script, style, iframe, noscript').remove();

      let title = $('meta[property="og:title"]').attr('content') || 
                $('title').text() || 
                $('h1').first().text() ||
                'Untitled Article';

      let content = $('body').text()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 10000); 

      if (content.length < 500) {
        const extracted = await this.geminiService.extractArticleContent(response.data, url);
        return {
          title: extracted.title || title,
          content: extracted.content
        };
      }

      return { title, content };
    } catch (error) {
      console.error(`Scraping failed for ${url}:`, error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error(`Request timed out for ${url}`);
        } else if (error.response) {
          console.error(`Server responded with status ${error.response.status} for ${url}`);
        } else {
          console.error(`Request failed for ${url}: ${error.message}`);
        }
      }
  
      try {
        const response = await axios.get(url);
        const extracted = await this.geminiService.extractArticleContent(response.data, url);
        return extracted;
      } catch (fallbackError) {
        throw new Error(`Failed to scrape article: ${url}`);
      }
    }
  }
}