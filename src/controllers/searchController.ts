import { Request, Response } from 'express';
import { hybridSearch, generateResponse } from '../services/searchService';

export const search = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.body;

  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  try {
    const searchResults = await hybridSearch(query);
    const context = searchResults.map((result: any) => result._source.text).join('\n');
    const answer = await generateResponse(query, context);

    res.json({ query, answer, context });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};