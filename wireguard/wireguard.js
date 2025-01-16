import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function startWireGuard() {
    try {
        console.log('Запуск WireGuard...');
        
        // Включаем IP-форвардинг
        await execAsync('sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"');
        
        // Создаем интерфейс и настраиваем его
        await execAsync('sudo ip link add dev wg0 type wireguard || true');
        await execAsync('sudo ip addr add 10.0.0.1/24 dev wg0 || true');
        await execAsync('sudo wg setconf wg0 /etc/wireguard/wg0.conf');
        await execAsync('sudo ip link set up dev wg0');
        
        // Настраиваем iptables
        await execAsync('sudo iptables -A FORWARD -i wg0 -j ACCEPT || true');
        await execAsync('sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE || true');
        
        console.log('WireGuard успешно запущен');
    } catch (error) {
        console.error('Ошибка при запуске WireGuard:', error.message);
        process.exit(1);
    }
}

async function stopWireGuard() {
    try {
        console.log('Остановка WireGuard...');
        
        // Удаляем правила iptables
        await execAsync('sudo iptables -D FORWARD -i wg0 -j ACCEPT || true');
        await execAsync('sudo iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE || true');
        
        // Отключаем и удаляем интерфейс
        await execAsync('sudo ip link set down dev wg0 || true');
        await execAsync('sudo ip link delete dev wg0 || true');
        
        console.log('WireGuard успешно остановлен');
    } catch (error) {
        console.error('Ошибка при остановке WireGuard:', error.message);
    }
}

// Обработка сигналов завершения
process.on('SIGINT', stopWireGuard);
process.on('SIGTERM', stopWireGuard);

// Обработка аргументов командной строки
const command = process.argv[2];
if (command === 'startWireGuard') {
    startWireGuard();
} else if (command === 'stopWireGuard') {
    stopWireGuard();
}

export {
    startWireGuard,
    stopWireGuard
}; 