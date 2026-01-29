require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8080;
const botType = process.env.BOT_TYPE || 'telegram';

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send(`Expense Bot is running on ${botType.toUpperCase()} platform!`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: botType });
});

// Initialize based on bot type
if (botType === 'telegram') {
  const { initTelegramBot } = require('./bots/telegramBot');
  const bot = initTelegramBot();

  // Telegram uses polling or webhooks
  // For development, use polling (no webhook needed)
  bot.launch().then(() => {
    console.log(`✅ Telegram bot is running (polling mode)`);
    console.log(`Bot will process messages in real-time`);
  }).catch(err => {
    console.error('Failed to start Telegram bot:', err);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

} else if (botType === 'whatsapp') {
  const twilio = require('twilio');

  // Twilio credentials
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const { handleIncomingMessage } = require('./handlers/messageHandler');

  // Webhook for incoming WhatsApp messages
  app.post('/webhook', async (req, res) => {
    try {
      const incomingMessage = req.body.Body;
      const senderPhone = req.body.From;

      console.log(`Message from ${senderPhone}: ${incomingMessage}`);

      // Handle the incoming message
      const response = await handleIncomingMessage(incomingMessage, senderPhone);

      // Send response back via Twilio
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: senderPhone,
        body: response,
      });

      res.status(200).send('Message processed');
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).send('Error processing message');
    }
  });

  console.log(`✅ WhatsApp bot is ready`);
  console.log(`Webhook URL should be: https://your-domain.com/webhook`);

} else {
  console.error(`Unknown bot type: ${botType}`);
  process.exit(1);
}

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Platform: ${botType.toUpperCase()}`);
});
