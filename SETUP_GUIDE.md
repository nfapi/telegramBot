# Setup Guide - Choose Your Platform

## Option 1: Telegram Bot (✅ RECOMMENDED - 100% Free)

**Pros:**
- ✅ Completely free
- ✅ Simple setup (5 minutes)
- ✅ No rate limits for personal use
- ✅ Instant API access
- ✅ Most reliable option

**Setup:**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Copy your token (looks like: `123456789:ABCDefg...`)
4. Create `.env` file and add:
   ```
   BOT_TYPE=telegram
   TELEGRAM_BOT_TOKEN=your_token_here
   GOOGLE_SHEETS_ID=your_sheet_id
   ```
5. Run: `npm start`

## Option 2: WhatsApp (Official Method - Costs Money)

**Costs:**
- Twilio: Pay-as-you-go (usually $0.01-0.02 per message)
- WhatsApp Business API: Volume-based pricing

**Setup:**
- Sign up for Twilio (free trial with $15 credit)
- Configure webhook to your server
- See `.env.example` for details

## Option 3: Discord Bot (Free Alternative)

**Pros:**
- ✅ Completely free
- ✅ Rich features
- ✅ Can create private server

**Cons:**
- Only works in Discord (not WhatsApp)

## Option 4: Self-Hosted WhatsApp (Advanced)

**Method:** Use `Whatsapp-web.js` library (unofficial)
- Completely free
- Requires more setup
- Less reliable than official API

---

## Recommended Setup

### Step 1: Create Google Sheet (Free)
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Get the ID from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`

### Step 2: Create Telegram Bot (Free)
1. Message `@BotFather` on Telegram
2. Send `/newbot`
3. Give it a name and username
4. Copy the token

### Step 3: Deploy for Free

**Option A: Railway (Free tier - Recommended)**
- Sign up at [Railway](https://railway.app)
- Connect GitHub repo
- Set environment variables
- Deploy automatically

**Option B: Render (Free tier)**
- Sign up at [Render](https://render.com)
- Deploy from GitHub
- Free SSL & auto-deploy

**Option C: Replit (Free tier)**
- Import GitHub repo to [Replit](https://replit.com)
- Run directly in browser
- No deployment needed

**Option D: Home Server**
- Run on your PC/Raspberry Pi
- Free forever
- Need to forward port if using Telegram webhooks

---

## Free vs Paid Comparison

| Feature | Telegram | WhatsApp (Free Trial) | WhatsApp (Paid) |
|---------|----------|----------------------|-----------------|
| Cost | $0 | $15 trial credit | $0.001+ per message |
| Setup time | 5 min | 20 min | 20 min |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Learning curve | Easy | Medium | Medium |

---

## Current Support

The bot currently supports:
- ✅ **Telegram** (ready to use)
- ✅ **WhatsApp** (via Twilio, requires paid account)
- ⏳ **Discord** (coming soon)

To switch platforms, just change `BOT_TYPE` in `.env`
