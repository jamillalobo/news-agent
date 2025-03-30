import express from 'express';

import { VectorDbService } from './services/vectorDbService';
import { EmbeddingService } from './services/embeddingService';
import { AgentController } from './controllers/agentController';
import dotenv from 'dotenv';
import  config from './config/config';

import { CsvProcessor } from './controllers/csvProcessor';
import { errorHandler } from './middlewares/errorHandler';
import { ScraperService } from './services/scraperService';

dotenv.config();

async function initializeApp() {

  const scraperService = new ScraperService();
  const vectorDbService = new VectorDbService();
  const embeddingService = new EmbeddingService();

  const csvProcessor = new CsvProcessor(scraperService, vectorDbService, embeddingService);
  try {
    console.log('Starting CSV processing...');
    await csvProcessor.processCsv('./src/data/articles_dataset.csv');
    console.log('CSV processing completed successfully');
  } catch (error) {
    console.error('Error processing CSV:', error);
  }

  const app = express();
  app.use(express.json());

  const agentController = new AgentController();
  app.post('/api/agent', agentController.handleAgentRequest.bind(agentController));

  app.use(errorHandler);

  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
    console.log(`Access: http://localhost:${config.PORT}/api/agent`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

initializeApp().catch(error => {
  console.error('Failed to initialize application:', error);
  process.exit(1);
});