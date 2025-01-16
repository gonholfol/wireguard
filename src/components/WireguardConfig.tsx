import React, { useState } from 'react';
import './WireguardConfig.css';

interface ConfigStatus {
    success: boolean;
    message: string;
    details?: string;
}

const WireguardConfig: React.FC = () => {
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{message: string; details?: string} | null>(null);
    const [status, setStatus] = useState<ConfigStatus | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatus(null);

        try {
            const response = await fetch('/api/wireguard/generate-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clientName }),
            });

            const contentType = response.headers.get('content-type');
            if (!response.ok) {
                const errorData = contentType?.includes('application/json') 
                    ? await response.json()
                    : { error: 'Неизвестная ошибка', details: 'Не удалось получить детали ошибки' };
                    
                throw new Error(errorData.error, { cause: errorData.details });
            }

            // Скачивание файла
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clientName.replace(/[^a-zA-Z0-9]/g, '_')}.conf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setStatus({
                success: true,
                message: 'Конфигурация успешно сгенерирована!',
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Неизвестная ошибка';
            const errorDetails = err.cause || 'Не удалось получить детали ошибки';
            
            setError({
                message: errorMessage,
                details: errorDetails
            });
            setStatus({
                success: false,
                message: errorMessage,
                details: errorDetails
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wireguard-config">
            <h2>Генерация конфигурации WireGuard</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="clientName">Имя устройства:</label>
                    <input
                        type="text"
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Например: iPhone или Laptop"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Генерация...' : 'Скачать конфигурацию'}
                </button>
                
                {status && (
                    <div className={`status ${status.success ? 'success' : 'error'}`}>
                        <p className="status-message">{status.message}</p>
                        {status.details && <p className="status-details">{status.details}</p>}
                        {status.success && (
                            <div className="instructions">
                                <h3>Инструкция по установке:</h3>
                                <ol>
                                    <li>Установите приложение WireGuard на ваше устройство</li>
                                    <li>Откройте скачанный файл конфигурации в приложении WireGuard</li>
                                    <li>Активируйте подключение в приложении WireGuard</li>
                                </ol>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default WireguardConfig; 