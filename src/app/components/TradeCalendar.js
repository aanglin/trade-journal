"use client";

import { useMemo } from "react";
import { calculateProfit } from "@/app/lib/calculations";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TradeCalendar({
  trades,
  currentMonth,
  setCurrentMonth,
  onEmptyDayClick,
  onTradeDayClick,
}) {
  

  const dailyResults = useMemo(() => {
  return trades.reduce((results, trade) => {
    if (!trade.date) return results;

    if (!results[trade.date]) {
      results[trade.date] = {
        profit: 0,
        tradeCount: 0,
        trades: [],
      };
    }

    results[trade.date].profit += calculateProfit(trade);
    results[trade.date].tradeCount += 1;
    results[trade.date].trades.push(trade);

    return results;
  }, {});
}, [trades]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startingWeekDay = firstDayOfMonth.getDay();

  const calendarDays = [];

  for (let i = 0; i < startingWeekDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  function previousMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function goToCurrentMonth() {
    const today = new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );
  }

  function createDateKey(day) {
    const monthNumber = String(month + 1).padStart(2, "0");
    const dayNumber = String(day).padStart(2, "0");

    return `${year}-${monthNumber}-${dayNumber}`;
  }

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
      <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Trading Calendar
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Green days were profitable. Red days finished negative.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CalendarButton
            onClick={previousMonth}
            label="Previous month"
          >
            ←
          </CalendarButton>

          <button
            type="button"
            onClick={goToCurrentMonth}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Today
          </button>

          <CalendarButton
            onClick={nextMonth}
            label="Next month"
          >
            →
          </CalendarButton>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <h3 className="mb-5 text-center text-lg font-semibold text-slate-200">
          {monthName}
        </h3>

        <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-800">
          {weekDays.map((weekDay) => (
            <div
              key={weekDay}
              className="border-b border-r border-slate-800 bg-slate-950 px-1 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 last:border-r-0 sm:text-sm"
            >
              {weekDay}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-24 border-b border-r border-slate-800 bg-slate-950/40 sm:min-h-32"
                />
              );
            }

            const dateKey = createDateKey(day);
            const dayResult = dailyResults[dateKey];
            const profit = dayResult?.profit ?? 0;
            const tradeCount = dayResult?.tradeCount ?? 0;

            let dayStyle =
              "bg-slate-900 hover:bg-slate-800";

            if (dayResult && profit > 0) {
  dayStyle =
    "bg-emerald-500/50 ring-1 ring-inset ring-emerald-300 hover:bg-emerald-500/65";
}

if (dayResult && profit < 0) {
  dayStyle =
    "bg-red-500/50 ring-1 ring-inset ring-red-300 hover:bg-red-500/65";
}

            if (dayResult && profit === 0) {
              dayStyle =
                "bg-slate-800 hover:bg-slate-700";
            }

            return (
              <button
  key={dateKey}
  type="button"
  onClick={() => {
    if (dayResult) {
      onTradeDayClick(dateKey, dayResult.trades);
    } else {
      onEmptyDayClick(dateKey);
    }
  }}
  className={`min-h-24 border-b border-r border-slate-800 p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:min-h-32 sm:p-3 ${dayStyle}`}
  aria-label={
    dayResult
      ? `View ${tradeCount} trades from ${dateKey}`
      : `Add a trade for ${dateKey}`
  }
>
                <div className="flex items-start justify-between gap-1">
                  <span className="font-semibold text-slate-300">
                    {day}
                  </span>

                  {tradeCount > 0 && (
                    <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] text-slate-300 sm:text-xs">
                      {tradeCount}
                    </span>
                  )}
                </div>

                {dayResult && (
                  <div className="mt-4">
                    <p
                      className={`text-xs font-bold sm:text-base ${
                        profit > 0
                          ? "text-emerald-400"
                          : profit < 0
                            ? "text-red-400"
                            : "text-slate-300"
                      }`}
                    >
                      {formatSignedMoney(profit)}
                    </p>

                    <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                      {tradeCount}{" "}
                      {tradeCount === 1 ? "trade" : "trades"}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-400">
          <CalendarKey
            className="bg-emerald-500"
            label="Profitable day"
          />

          <CalendarKey
            className="bg-red-500"
            label="Losing day"
          />

          <CalendarKey
            className="bg-slate-700"
            label="Break-even day"
          />
        </div>
      </div>
    </section>
  );
}

function CalendarButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function CalendarKey({ className, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3.5 w-3.5 rounded ${className}`} />
      <span>{label}</span>
    </div>
  );
}

function formatSignedMoney(amount) {
  const number = Number(amount || 0);

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(number));

  if (number > 0) return `+${formatted}`;
  if (number < 0) return `-${formatted}`;

  return formatted;
}