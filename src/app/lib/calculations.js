// app/lib/calculations.js

export const COMMISSION_PER_CONTRACT = 0.65;
export const OPTION_TRADE_SIDES = 2;
export const OPTION_CONTRACT_MULTIPLIER = 100;

/**
 * Calculates the automatic opening and closing commission.
 *
 * Example:
 * 1 contract × $0.65 × 2 sides = $1.30
 */
export function calculateCommission(trade = {}) {
  const contracts = getPositiveNumber(trade.contracts);

  const commission =
    contracts *
    COMMISSION_PER_CONTRACT *
    OPTION_TRADE_SIDES;

  return roundCurrency(commission);
}

/**
 * Calculates the final net profit or loss for one option trade.
 *
 * Net P/L =
 * (exit price - entry price)
 * × 100
 * × contracts
 * - automatic commission
 * - other fees
 */
export function calculateProfit(trade = {}) {
  const entryPrice = getNumber(trade.entryPrice);
  const exitPrice = getNumber(trade.exitPrice);
  const contracts = getPositiveNumber(trade.contracts);
  const otherFees = getPositiveNumber(trade.fees);

  const grossProfit =
    (exitPrice - entryPrice) *
    OPTION_CONTRACT_MULTIPLIER *
    contracts;

  const commission = calculateCommission(trade);

  return roundCurrency(
    grossProfit - commission - otherFees
  );
}

/**
 * Adds the net P/L from every saved trade.
 */
export function totalProfit(trades = []) {
  const total = trades.reduce((sum, trade) => {
    return sum + calculateProfit(trade);
  }, 0);

  return roundCurrency(total);
}

/**
 * Starting balance plus total trading profit or loss.
 */
export function currentBalance(
  startingBalance,
  trades = []
) {
  const balance =
    getNumber(startingBalance) +
    totalProfit(trades);

  return roundCurrency(balance);
}

/**
 * Percentage of trades that finished profitable.
 *
 * Break-even trades count as non-winning trades.
 */
export function winRate(trades = []) {
  if (trades.length === 0) {
    return 0;
  }

  const winningTrades = trades.filter((trade) => {
    return calculateProfit(trade) > 0;
  }).length;

  return Math.round(
    (winningTrades / trades.length) * 100
  );
}

/**
 * Average net profit among winning trades.
 */
export function averageWinner(trades = []) {
  const winners = trades
    .map((trade) => calculateProfit(trade))
    .filter((profit) => profit > 0);

  if (winners.length === 0) {
    return 0;
  }

  const totalWinnings = winners.reduce(
    (sum, profit) => sum + profit,
    0
  );

  return roundCurrency(
    totalWinnings / winners.length
  );
}

/**
 * Average net result among losing trades.
 *
 * This intentionally returns a negative number.
 */
export function averageLoser(trades = []) {
  const losers = trades
    .map((trade) => calculateProfit(trade))
    .filter((profit) => profit < 0);

  if (losers.length === 0) {
    return 0;
  }

  const totalLosses = losers.reduce(
    (sum, profit) => sum + profit,
    0
  );

  return roundCurrency(
    totalLosses / losers.length
  );
}

/**
 * Gross winning profits divided by gross losing profits.
 *
 * Returns:
 * 0 when there are no winning trades
 * Infinity when there are wins but no losses
 */
export function profitFactor(trades = []) {
  const results = trades.map((trade) =>
    calculateProfit(trade)
  );

  const grossWins = results
    .filter((profit) => profit > 0)
    .reduce((sum, profit) => sum + profit, 0);

  const grossLosses = Math.abs(
    results
      .filter((profit) => profit < 0)
      .reduce((sum, profit) => sum + profit, 0)
  );

  if (grossWins === 0) {
    return 0;
  }

  if (grossLosses === 0) {
    return Infinity;
  }

  return grossWins / grossLosses;
}

/**
 * Calculates P/L for today, the current trading week,
 * or the current calendar month.
 *
 * The trading week begins Monday.
 */
export function profitByPeriod(
  trades = [],
  period
) {
  const today = new Date();

  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const weekStart = startOfTradingWeek(today);
  const weekEnd = endOfTradingWeek(today);

  const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const monthEnd = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const total = trades.reduce((sum, trade) => {
    const tradeDate = parseLocalDate(
      trade.date
    );

    if (!tradeDate) {
      return sum;
    }

    let matchesPeriod = false;

    if (period === "today") {
      matchesPeriod =
        tradeDate >= todayStart &&
        tradeDate <= todayEnd;
    }

    if (period === "week") {
      matchesPeriod =
        tradeDate >= weekStart &&
        tradeDate <= weekEnd;
    }

    if (period === "month") {
      matchesPeriod =
        tradeDate >= monthStart &&
        tradeDate <= monthEnd;
    }

    if (!matchesPeriod) {
      return sum;
    }

    return sum + calculateProfit(trade);
  }, 0);

  return roundCurrency(total);
}

/**
 * Converts YYYY-MM-DD into a local Date.
 * This avoids timezone shifts on calendar dates.
 */
function parseLocalDate(dateString) {
  if (
    typeof dateString !== "string" ||
    !dateString
  ) {
    return null;
  }

  const dateParts = dateString
    .split("-")
    .map(Number);

  if (dateParts.length !== 3) {
    return null;
  }

  const [year, month, day] = dateParts;

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function startOfDay(date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfDay(date) {
  const result = new Date(date);

  result.setHours(23, 59, 59, 999);

  return result;
}

/**
 * Monday at 12:00 a.m.
 */
function startOfTradingWeek(date) {
  const result = startOfDay(date);
  const dayOfWeek = result.getDay();

  const daysSinceMonday =
    dayOfWeek === 0
      ? 6
      : dayOfWeek - 1;

  result.setDate(
    result.getDate() - daysSinceMonday
  );

  return result;
}

/**
 * Sunday at 11:59:59 p.m.
 */
function endOfTradingWeek(date) {
  const result = startOfTradingWeek(date);

  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);

  return result;
}

function getNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function getPositiveNumber(value) {
  const number = getNumber(value);

  return number > 0 ? number : 0;
}

function roundCurrency(value) {
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;
}