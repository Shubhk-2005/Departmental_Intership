
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Internship Portal Backend is running');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Firebase Project ID: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
});
