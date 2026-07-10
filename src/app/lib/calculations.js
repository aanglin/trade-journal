// src/lib/calculations.js

export function calculateProfit(trade) {
  const entry = Number(trade.entryPrice);
  const exit = Number(trade.exitPrice);
  const contracts = Number(trade.contracts);
  const commission = Number(trade.commission || 0);
  const fees = Number(trade.fees || 0);

  const grossProfit = (exit - entry) * 100 * contracts;

  return grossProfit - commission - fees;
}

export function totalProfit(trades) {
  return trades.reduce((sum, trade) => sum + calculateProfit(trade), 0);
}

export function currentBalance(startingBalance, trades) {
  return Number(startingBalance) + totalProfit(trades);
}

export function winRate(trades) {
  if (trades.length === 0) return 0;

  const wins = trades.filter((trade) => calculateProfit(trade) > 0).length;
  return Math.round((wins / trades.length) * 100);
}

export function averageWinner(trades) {
  const winners = trades.map(calculateProfit).filter((profit) => profit > 0);
  if (winners.length === 0) return 0;

  return winners.reduce((sum, profit) => sum + profit, 0) / winners.length;
}

export function averageLoser(trades) {
  const losers = trades.map(calculateProfit).filter((profit) => profit < 0);
  if (losers.length === 0) return 0;

  return losers.reduce((sum, profit) => sum + profit, 0) / losers.length;
}

export function profitFactor(trades) {
  const profits = trades.map(calculateProfit);

  const grossWins = profits
    .filter((profit) => profit > 0)
    .reduce((sum, profit) => sum + profit, 0);

  const grossLosses = Math.abs(
    profits
      .filter((profit) => profit < 0)
      .reduce((sum, profit) => sum + profit, 0)
  );

  if (grossLosses === 0) return grossWins > 0 ? grossWins : 0;

  return grossWins / grossLosses;
}

export function profitByPeriod(trades, period) {
  const today = new Date();

  return trades.reduce((sum, trade) => {
    const tradeDate = new Date(trade.date + "T00:00:00");

    let match = false;

    if (period === "today") {
      match = tradeDate.toDateString() === today.toDateString();
    }

    if (period === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      match = tradeDate >= startOfWeek;
    }

    if (period === "month") {
      match =
        tradeDate.getMonth() === today.getMonth() &&
        tradeDate.getFullYear() === today.getFullYear();
    }

    return match ? sum + calculateProfit(trade) : sum;
  }, 0);
}