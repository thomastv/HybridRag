import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_EMBEDDING_API_URL = process.env.OPENAI_EMBEDDING_API_URL || 'https://api.openai.com/v1/embeddings';

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await axios.post(
      OPENAI_EMBEDDING_API_URL,
      {
        input: text,
        model: 'text-embedding-ada-002',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}