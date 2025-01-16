import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Настройка CORS для GitHub Pages
const corsOptions = {
    origin: [
        'https://your-username.github.io',
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Проверка здоровья сервера
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Импортируем роутер динамически
const importRouter = async () => {
    try {
        const { default: wireguardRouter } = await import('./src/api/wireguard.js');
        app.use('/api/wireguard', wireguardRouter);
        
        app.listen(port, '0.0.0.0', () => {
            console.log(`Сервер запущен на порту ${port}`);
        });
    } catch (error) {
        console.error('Ошибка при импорте роутера:', error);
        process.exit(1);
    }
};

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        details: err.message
    });
});

// Запускаем сервер
importRouter().catch(error => {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
}); 