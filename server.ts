import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3001;

// Настройка CORS для GitHub Pages
const corsOptions = {
    origin: [
        'https://gonholfol.github.io',
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Логирование запросов
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Проверка здоровья сервера
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Базовый маршрут для API
app.get('/api', (_req: Request, res: Response) => {
    res.json({
        message: 'WireGuard API работает',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            generateConfig: '/api/wireguard/generate-config'
        }
    });
});

// Импортируем роутер динамически
const importRouter = async () => {
    try {
        const { default: wireguardRouter } = await import('./src/api/wireguard.js');
        app.use('/api/wireguard', wireguardRouter);
        
        app.listen(port, '0.0.0.0', () => {
            console.log(`Сервер запущен на порту ${port}`);
            console.log(`API доступно по адресу: https://gonholfol.github.io/wireguard/api`);
            console.log('Доступные эндпоинты:');
            console.log('- GET  /health');
            console.log('- GET  /api');
            console.log('- POST /api/wireguard/generate-config');
        });
    } catch (error) {
        console.error('Ошибка при импорте роутера:', error);
        process.exit(1);
    }
};

// Обработка ошибок
interface ErrorWithMessage {
    message: string;
}

app.use((err: ErrorWithMessage, req: Request, res: Response, _next: NextFunction) => {
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