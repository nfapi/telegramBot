# Expense Tracking Bot

A bot that helps you track daily expenses and automatically stores them in a Google Sheet with categories and totals.

## Features

- 📱 **Multi-Platform**: Telegram (free) or WhatsApp
- 💬 **Easy Input**: Send expenses via messages
- 📊 **Automatic Categorization**: Expenses are automatically categorized
- 📈 **Google Sheets Storage**: All expenses saved to Google Sheets
- 💰 **Monthly Reports**: Get summaries of your spending by category
- 🎯 **Flexible Input**: Supports multiple expense entry formats

## Quick Start (Telegram - Free!)

### Prerequisites
- Node.js (v14 or higher)
- A Telegram account
- Google Cloud account with Google Sheets API enabled

### Installation

1. Clone or create the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

### Setup (5 minutes)

#### Step 1: Create Telegram Bot
1. Open Telegram and find **`@BotFather`**
2. Send `/newbot`
3. Follow the prompts and copy your token
4. Add to `.env`:
   ```
   BOT_TYPE=telegram
   TELEGRAM_BOT_TOKEN=your_token_here
   ```

#### Step 2: Setup Google Sheets
1. Go to [Google Sheets](https://sheets.google.com) and create a new sheet
2. Get the Sheet ID from the URL: `docs.google.com/spreadsheets/d/SHEET_ID/edit`
3. Create a service account in [Google Cloud Console](https://console.cloud.google.com/)
4. Download the JSON key and add to `.env`:
   ```
   GOOGLE_SHEETS_ID=your_sheet_id
   GOOGLE_CLIENT_EMAIL=your_email@...iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY=your_private_key
   ```

### Running the Bot

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

That's it! Start using the bot immediately.

## Usage

Open Telegram and find your bot (same name you gave @BotFather).

### Sending Expenses

Send a message with your expense in any format:
```
Coffee 5
Lunch $12.50
Gas 45.99 fuel
Food 25 (restaurant)
Transport 5.50
```

The bot will parse it, extract the category and amount, and save it to your Google Sheet.

### Commands

- **`/help`** - Show usage instructions
- **`/report`** - Get monthly expense summary by category
- **`/start`** - Show welcome message

### Example Conversation

```
You: Coffee 5
Bot: ✅ Expense recorded!
     💰 Coffee: $5.00
     📝 2026-01-26

You: /report
Bot: 📊 Monthly Expense Report

     Coffee: $5.00 (50%)
     Lunch: $5.00 (50%)

     💰 Total: $10.00
     📈 Entries: 2
```

## Switching to WhatsApp

To use WhatsApp instead:

1. Sign up for [Twilio](https://www.twilio.com/) (free trial includes $15 credit)
2. Get your Account SID, Auth Token, and WhatsApp number
3. Update `.env`:
   ```
   BOT_TYPE=whatsapp
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=whatsapp:+1234567890
   ```
4. Set your Twilio webhook to: `https://your-domain.com/webhook`

## Deployment (Free)

### Option 1: Railway (Recommended)
- Go to [Railway](https://railway.app)
- Connect your GitHub repo
- Set environment variables
- Auto-deploy on push

### Option 2: Render
- Go to [Render](https://render.com)
- Deploy from GitHub
- Free tier available

### Option 3: Replit
- Import project to [Replit](https://replit.com)
- Run directly in browser
- No deployment needed

### Option 4: Home Server
- Run on your PC/Raspberry Pi
- Free forever
- Just keep it running

## Project Structure

```
expense-bot/
├── src/
│   ├── index.js                 # Main Express server
│   ├── bots/
│   │   └── telegramBot.js       # Telegram bot handler
│   ├── handlers/
│   │   └── messageHandler.js    # Message processing logic
│   └── utils/
│       ├── expenseParser.js     # Parse natural language expenses
│       ├── sheetsManager.js     # Google Sheets integration
│       ├── googleAuth.js        # Google authentication
│       └── reports.js           # Generate expense reports
├── package.json
├── .env.example
├── .env                         # Your environment variables
└── README.md
```

## Supported Expense Formats

The bot is flexible with input formats:

| Format | Example | Parsed As |
|--------|---------|-----------|
| Category + Amount | `Coffee 5` | Coffee: 5 |
| Currency Symbol | `Lunch $12.50` | Lunch: 12.50 |
| Amount + Note | `Gas 45.99 fuel` | Gas: 45.99, Note: fuel |
| With Parentheses | `Food 25 (restaurant)` | Food: 25 |

## Troubleshooting

### Bot not responding (Telegram)
- Make sure `TELEGRAM_BOT_TOKEN` is correct
- Verify bot is running (should see "polling mode" in logs)
- Restart the bot

### Bot not responding (WhatsApp)
- Check Twilio webhook URL is correct
- Verify webhook is POST method
- Check Twilio logs for delivery errors

### Google Sheets errors
- Verify service account email has access to the Sheet
- Check private key is properly formatted (newlines are `\n`)
- Confirm Sheet ID is correct

### Parsing issues
- Use clear category names
- Include numeric amount with decimals
- Best formats: "Coffee 5", "Lunch 12.50"

## Cost Breakdown

| Service | Cost |
|---------|------|
| Telegram Bot | FREE |
| Google Sheets | FREE |
| Server (Railway) | FREE tier or $5/month |
| **Total** | **FREE or $5/month** |

vs WhatsApp:
- Twilio: $0.01-0.02 per message (can add up!)
- Google Sheets: FREE
- Server: FREE tier or $5/month
- **Total: Minimum $50-100/month** for regular usage

## See Also

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions for all platforms
- [Telegraf Documentation](https://telegraf.dev/) - Telegram bot framework

## License

ISC

## Support

Check the troubleshooting section or review code comments in `src/`.
