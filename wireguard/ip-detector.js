import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const execAsync = promisify(exec);

async function getExternalIP() {
    try {
        // Попробуем несколько методов определения IP
        const methods = [
            // Метод 1: curl ifconfig.me
            async () => {
                const { stdout } = await execAsync('curl -s ifconfig.me');
                return stdout.trim();
            },
            // Метод 2: dig +short myip.opendns.com @resolver1.opendns.com
            async () => {
                const { stdout } = await execAsync('dig +short myip.opendns.com @resolver1.opendns.com');
                return stdout.trim();
            },
            // Метод 3: API ipify
            async () => {
                return new Promise((resolve, reject) => {
                    https.get('https://api.ipify.org', (resp) => {
                        let data = '';
                        resp.on('data', (chunk) => { data += chunk; });
                        resp.on('end', () => resolve(data.trim()));
                    }).on('error', reject);
                });
            }
        ];

        // Пробуем каждый метод по очереди
        for (const method of methods) {
            try {
                const ip = await method();
                if (ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
                    return ip;
                }
            } catch (err) {
                console.log('Метод определения IP не сработал, пробуем следующий...');
            }
        }

        throw new Error('Не удалось определить внешний IP-адрес');
    } catch (error) {
        console.error('Ошибка при определении IP:', error);
        throw error;
    }
}

// Кэширование IP-адреса
let cachedIP = null;
let lastCheck = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

async function getServerIP() {
    const now = Date.now();
    if (cachedIP && (now - lastCheck) < CACHE_DURATION) {
        return cachedIP;
    }

    cachedIP = await getExternalIP();
    lastCheck = now;
    return cachedIP;
}

export {
    getServerIP
}; 