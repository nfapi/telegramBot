const { getUserExpenses } = require('./sheetsManager');

/**
 * Generate a monthly expense report
 */
async function getMonthlyReport(senderPhone) {
  try {
    const expenses = await getUserExpenses(senderPhone);

    if (expenses.length === 0) {
      return '📊 No expenses recorded yet.\n\nStart by sending me your daily expenses!';
    }

    // Group by category and calculate totals
    const categoryTotals = {};
    let grandTotal = 0;

    expenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
      grandTotal += expense.amount;
    });

    // Sort categories by total (descending)
    const sortedCategories = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    );

    // Build report message
    let report = '📊 Monthly Expense Report\n\n';

    sortedCategories.forEach(([category, total]) => {
      const percentage = ((total / grandTotal) * 100).toFixed(1);
      report += `${category}: $${total.toFixed(2)} (${percentage}%)\n`;
    });

    report += `\n💰 Total: $${grandTotal.toFixed(2)}`;
    report += `\n📈 Entries: ${expenses.length}`;

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    return 'Error generating report. Please try again later.';
  }
}

module.exports = {
  getMonthlyReport,
};
