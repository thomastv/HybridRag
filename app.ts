import express from 'express';
import cors from 'cors';
import { search } from './src/controllers/searchController';
import { indexDocuments } from './src/controllers/indexController';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/search', search);
app.post('/index', indexDocuments);
export default app;