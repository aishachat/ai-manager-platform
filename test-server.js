import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Тестовый сервер запущен на порту ${PORT}`);
});


