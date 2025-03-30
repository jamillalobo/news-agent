import dotenv from 'dotenv';

dotenv.config();

interface Config {

  GEMINI_API_KEY: string;
  EMBEDDING_MODEL: string;
  GEMINI_MODEL: string;

  VECTOR_DB_TYPE: string;
  PG_CONNECTION_STRING?: string;

  PORT: number;
}

const config: Config = {

  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'embedding-001',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',

  VECTOR_DB_TYPE: 'pgvector',
  PG_CONNECTION_STRING: process.env.PG_CONNECTION_STRING,

  PORT: parseInt(process.env.PORT || '3000', 10),
};

Object.entries(config).forEach(([key, value]) => {
  if (value === undefined || value === '') {
    throw new Error(`Config error: Missing environment variable "${key}"`);
  }
});

export default config;

