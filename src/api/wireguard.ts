import express from 'express';
import { generateClientConfig } from '../../wireguard/config-generator.js';

const router = express.Router();

router.post('/generate-config', async (req, res) => {
    try {
        console.log('Получен запрос на генерацию конфигурации');
        const { clientName } = req.body;
        
        if (!clientName) {
            console.log('Ошибка: не указано имя устройства');
            return res.status(400).json({ 
                error: 'Не указано имя устройства',
                details: 'Пожалуйста, укажите имя устройства для генерации конфигурации'
            });
        }

        console.log(`Генерация конфигурации для устройства: ${clientName}`);
        
        // Проверяем наличие файла конфигурации
        try {
            await import('fs').then(fs => fs.promises.access('/etc/wireguard/wg0.conf'));
        } catch (error) {
            console.error('Ошибка: файл конфигурации WireGuard не найден');
            return res.status(500).json({
                error: 'WireGuard не настроен',
                details: 'Пожалуйста, выполните сначала настройку WireGuard (pnpm run wireguard:setup)'
            });
        }

        const config = await generateClientConfig(clientName);
        
        if (!config) {
            console.error('Ошибка: конфигурация не была сгенерирована');
            throw new Error('Не удалось сгенерировать конфигурацию');
        }

        console.log('Конфигурация успешно сгенерирована');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${clientName.replace(/[^a-zA-Z0-9]/g, '_')}.conf`);
        res.send(config);
    } catch (error) {
        console.error('Ошибка при генерации конфигурации:', error);
        res.status(500).json({ 
            error: 'Ошибка при генерации конфигурации',
            details: error.message || 'Неизвестная ошибка'
        });
    }
});

export default router; 