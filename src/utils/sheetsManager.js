const { google } = require('googleapis');
const { getAuthClient } = require('./googleAuth');

// Cache for spreadsheet data to avoid repeated API calls
const sheetCache = {};

/**
 * Get or create a sheet for a user 
 */
async function getUserSheet(senderPhone) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    
    // Normalize phone number for sheet name
    const sheetName = `User_${senderPhone.replace(/\D/g, '')}`.slice(0, 31);

    // Get spreadsheet metadata to check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    let sheetId = null;
    for (const sheet of spreadsheet.data.sheets) {
      if (sheet.properties.title === sheetName) {
        sheetId = sheet.properties.sheetId;
        break;
      }
    }

    // Create sheet if it doesn't exist
    if (sheetId === null) {
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
      sheetId = response.data.replies[0].addSheet.properties.sheetId;

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:D1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Date', 'Category', 'Amount', 'Note']],
        },
      });
    }

    return { sheetName, sheetId };
  } catch (error) {
    console.error('Error managing user sheet:', error);
    throw error;
  }
}

/**
 * Add expense to the spreadsheet
 */
async function addExpenseToSheet(expense, senderPhone) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const { sheetName } = await getUserSheet(senderPhone);

    // Format date as YYYY-MM-DD
    const dateStr = expense.date.toISOString().split('T')[0];

    // Add the expense as a new row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:D`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            dateStr,
            expense.category,
            expense.amount,
            expense.note || '',
          ],
        ],
      },
    });

    console.log(`Expense added for ${senderPhone}`);
  } catch (error) {
    console.error('Error adding expense to sheet:', error);
    throw error;
  }
}

/**
 * Get all expenses for a user
 */
async function getUserExpenses(senderPhone) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const { sheetName } = await getUserSheet(senderPhone);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:D`,
    });

    const rows = response.data.values || [];
    const expenses = [];

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= 3) {
        expenses.push({
          date: row[0],
          category: row[1],
          amount: parseFloat(row[2]),
          note: row[3] || '',
        });
      }
    }

    return expenses;
  } catch (error) {
    console.error('Error getting user expenses:', error);
    throw error;
  }
}

module.exports = {
  addExpenseToSheet,
  getUserSheet,
  getUserExpenses,
};
