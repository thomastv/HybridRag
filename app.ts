import express from 'express';
import cors from 'cors';
import { search } from './src/controllers/searchController';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/search', search);

export default app;