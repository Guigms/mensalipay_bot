const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Configuração do WhatsApp com argumentos essenciais para servidores Linux (Render)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Gera o QR Code no terminal do Render para tu leres com o telemóvel
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneia este QR Code com o teu WhatsApp');
});

client.on('ready', () => {
    console.log('Robô do WhatsApp conectado e pronto a enviar mensagens!');
});

// Rota que o teu backend na Vercel vai chamar para enviar mensagens
app.post('/api/send', async (req, res) => {
    const { number, message } = req.body;
    
    if (!number || !message) {
        return res.status(400).json({ error: 'Número e mensagem são obrigatórios.' });
    }

    try {
        // O formato do WhatsApp exige o sufixo @c.us no número (ex: 5511999999999@c.us)
        const chatId = `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.status(200).json({ success: true, message: 'Notificação enviada!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rota de "saúde" para impedir que o Render adormeça
app.get('/ping', (req, res) => {
    res.status(200).send('Estou acordado!');
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor do Robô a correr na porta ${PORT}`);
});