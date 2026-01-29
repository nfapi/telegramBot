const { parseExpense } = require('../utils/expenseParser');
const { addExpenseToSheet } = require('../utils/sheetsManager');
const { getMonthlyReport } = require('../utils/reports');

async function handleIncomingMessage(message, senderPhone) {
  const messageLower = message.toLowerCase().trim();

  // Help command
  if (messageLower === 'help' || messageLower === '/help') {
    return getHelpMessage();
  }

  // Report command
  if (messageLower === 'report' || messageLower === '/report') {
    try {
      const report = await getMonthlyReport(senderPhone);
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      return 'Error generating report. Please try again later.';
    }
  }

  // Expense entry
  try {
    const expense = parseExpense(message);
    
    if (!expense) {
      return `I couldn't parse that expense. Please use one of these formats:\n\n- "Coffee 5" (category and amount)\n- "Lunch $12.50"\n- "Gas 45.99 fuel"\n\nType "help" for more options.`;
    }

    // Add to Google Sheets
    await addExpenseToSheet(expense, senderPhone);

    return `✅ Expense recorded!\n💰 ${expense.category}: ${expense.currency}${expense.amount.toFixed(2)}\n📝 ${new Date().toLocaleDateString()}`;
  } catch (error) {
    console.error('Error processing expense:', error);
    return 'Error saving expense. Please try again.';
  }
}

function getHelpMessage() {
  return `📊 WhatsApp Expense Bot\n\nCommands:\n
/help - Show this message
/report - Get monthly summary

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
}

module.exports = {
  handleIncomingMessage,
};
