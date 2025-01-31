import client from '../models/elasticsearchClient';
import { generateEmbedding } from './embeddingService';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const INDEX_NAME = process.env.ELASTICSEARCH_INDEX || 'documents';
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/completions';

export async function vectorSearch(queryEmbedding: number[], topK: number = 5): Promise<any[]> {
  try {
    const scriptQuery = {
      script_score: {
        query: { match_all: {} },
        script: {
          source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
          params: { query_vector: queryEmbedding },
        },
      },
    };

    const body = await client.search({
      index: INDEX_NAME,
      body: {
        size: topK,
        query: scriptQuery,
      },
    });

    return body.hits.hits;
  } catch (error) {
    console.error('Error in vectorSearch:', error);
    throw error;
  }
}

export async function textSearch(query: string, topK: number = 5): Promise<any[]> {
  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        size: topK,
        query: {
          match: {
            text: query,
          },
        },
      },
    });

    return response.hits.hits;
  } catch (error) {
    console.error('Error in textSearch:', error);
    throw error;
  }
}

export async function hybridSearch(query: string, topK: number = 5): Promise<any[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const vectorResults = await vectorSearch(queryEmbedding, topK);
    const textResults = await textSearch(query, topK);

    const combinedResults = [...vectorResults, ...textResults];
    combinedResults.sort((a, b) => (b._score ?? 0) - (a._score ?? 0));

    return combinedResults.slice(0, topK);
  } catch (error) {
    console.error('Error in hybridSearch:', error);
    throw error;
  }
}

export async function generateResponse(query: string, context: string): Promise<string> {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        prompt: `Context: ${context}\n\nQuestion: ${query}\nAnswer:`,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error;
  }
}