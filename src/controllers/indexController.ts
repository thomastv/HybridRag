import { Request, Response } from 'express';
import { extractTextFromPDF } from '../services/pdfService';
import { generateEmbedding } from '../services/embeddingService';
import client from '../models/elasticsearchClient';
import fs from 'fs';
import path from 'path';

const PDF_FOLDER = path.join(__dirname, '../../pdfData');

export const indexDocuments = async (req: Request, res: Response) : Promise<void> => {
  try {
    // Read all PDF files from the pdfData folder
    const files = fs.readdirSync(PDF_FOLDER).filter((file) => file.endsWith('.pdf'));

    if (files.length === 0) {
      res.status(400).json({ error: 'No PDF files found in the pdfData folder' });
      return;
    }

    // Process each PDF file
    for (const file of files) {
      const filePath = path.join(PDF_FOLDER, file);

      // Step 1: Extract text from the PDF
      const text = await extractTextFromPDF(filePath);

      // Step 2: Generate embedding using OpenAI
      const embedding = await generateEmbedding(text);

      // Step 3: Index the document in Elasticsearch
      await client.index({
        index: 'documents',
        body: {
          text,
          embedding,
        },
      });

      console.log(`Indexed document: ${file}`);
    }

    res.json({ message: `Successfully indexed ${files.length} documents` });
  } catch (error) {
    console.error('Error indexing documents:', error);
    res.status(500).json({ error: 'An error occurred while indexing documents' });
  }
};