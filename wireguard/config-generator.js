import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { getServerIP } from './ip-detector.js';

const execAsync = promisify(exec);

// Счетчик для IP-адресов клиентов
let clientIPCounter = 2;

async function getNextClientIP() {
    // Читаем текущую конфигурацию
    try {
        const config = await fs.readFile('/etc/wireguard/wg0.conf', 'utf8');
        const peers = config.split('[Peer]').length - 1;
        clientIPCounter = peers + 2; // +2 потому что начинаем с .2 и учитываем текущего клиента
    } catch (error) {
        console.warn('Не удалось прочитать конфигурацию, используем счетчик по умолчанию');
    }
    return `10.0.0.${clientIPCounter}/24`;
}

async function generateClientConfig(clientName) {
    try {
        // Генерация ключей для клиента
        const { stdout: privateKey } = await execAsync('wg genkey');
        const { stdout: publicKey } = await execAsync(`echo "${privateKey}" | wg pubkey`);
        
        // Чтение серверного публичного ключа
        const serverPublicKey = await fs.readFile('/etc/wireguard/publickey', 'utf8');
        
        // Получение IP сервера
        const serverIP = await getServerIP();
        
        // Получение следующего доступного IP для клиента
        const clientIP = await getNextClientIP();
        const clientIPWithoutMask = clientIP.split('/')[0];
        
        // Формирование конфигурации клиента
        const clientConfig = `[Interface]
PrivateKey = ${privateKey.trim()}
Address = ${clientIP}
DNS = 8.8.8.8, 8.8.4.4

[Peer]
PublicKey = ${serverPublicKey.trim()}
AllowedIPs = 0.0.0.0/0
Endpoint = ${serverIP}:51820
PersistentKeepalive = 25`;

        // Добавление клиента в конфигурацию сервера
        const peerConfig = `
[Peer]
# Name = ${clientName}
PublicKey = ${publicKey.trim()}
AllowedIPs = ${clientIPWithoutMask}/32`;

        await execAsync(`sudo bash -c 'echo "${peerConfig}" >> /etc/wireguard/wg0.conf'`);
        await execAsync('sudo systemctl restart wg-quick@wg0');

        return clientConfig;
    } catch (error) {
        console.error('Ошибка при генерации конфигурации:', error);
        throw error;
    }
}

export {
    generateClientConfig
}; 