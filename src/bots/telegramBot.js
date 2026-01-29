const { Telegraf } = require('telegraf');
const { handleIncomingMessage } = require('../handlers/messageHandler');

/**
 * Initialize Telegram bot
 */
function initTelegramBot() {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  // Log all incoming updates for debugging
  bot.use(async (ctx, next) => {
    console.log('Update type:', ctx.updateType);
    return next();
  });

  // Handle /start command
  bot.command('start', async (ctx) => {
    await ctx.reply(
      '👋 Welcome to Expense Bot!\n\n' +
      'Send me your daily expenses and I\'ll track them in Google Sheets.\n\n' +
      'Try:\n' +
      '• "Coffee 5" - Add $5 for Coffee\n' +
      '• "Lunch $12.50" - Add $12.50 for Lunch\n' +
      '• "/help" - Show all commands\n' +
      '• "/report" - See your monthly summary'
    );
  });

  // Handle /help command
  bot.command('help', async (ctx) => {
    const response = `📊 WhatsApp Expense Bot\n\nCommands:\n
/help - Show this message
/report - Get monthly summary
/start - Show welcome message

How to add expenses:\n
1️⃣ "Coffee 5" - category and amount
2️⃣ "Lunch $12.50" - with currency symbol
3️⃣ "Gas 45.99 fuel" - amount and optional note
4️⃣ "Dinner 25 (restaurant)" - with category in brackets

Examples:
• "Food 15"
• "Transport 5.50"
• "Utilities 100"
• "Entertainment 25.99"

Your expenses are stored and categorized automatically!`;
    await ctx.reply(response);
  });

  // Handle /report command
  bot.command('report', async (ctx) => {
    try {
      const userId = ctx.from.id.toString();
      const response = await handleIncomingMessage('/report', userId);
      await ctx.reply(response);
    } catch (error) {
      console.error('Error handling report command:', error);
      await ctx.reply('Error generating report. Please try again.');
    }
  });

  // Handle regular messages (expenses)
  bot.on('text', async (ctx) => {
    try {
      const userId = ctx.from.id.toString();
      const message = ctx.message.text;

      const response = await handleIncomingMessage(message, userId);
      await ctx.reply(response);
    } catch (error) {
      console.error('Error processing message:', error);
      await ctx.reply('Error processing your message. Please try again.');
    }
  });

  // Error handler
  bot.catch((err) => {
    console.error('Telegraf error:', err);
  });

  return bot;
}

module.exports = {
  initTelegramBot,
};
