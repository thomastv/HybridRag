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

      // Step 2: Chunk the text
      const CHUNK_SIZE = 500;
      const chunks = [];
      for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.slice(i, i + CHUNK_SIZE));
      }

      // Step 3: Process each chunk
      for (const chunk of chunks) {
      // Step 4: Generate embedding using OpenAI
      const embedding = await generateEmbedding(chunk);
      console.log("Generated Embedding");

      // Step 5: Index the document chunk in Elasticsearch
      await client.index({
        index: 'documents',
        body: {
        text: chunk,
        embedding,
        },
      });

      console.log(`Indexed document chunk: ${file}`);
      }
    }

    res.json({ message: `Successfully indexed ${files.length} documents` });
  } catch (error) {
    console.error('Error indexing documents');
    res.status(500).json({ error: 'An error occurred while indexing documents' });
  }
};