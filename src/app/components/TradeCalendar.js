"use client";

import { useMemo } from "react";
import { calculateProfit } from "@/app/lib/calculations";

const WEEK_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export default function TradeCalendar({
  trades,
  currentMonth,
  setCurrentMonth,
  onEmptyDayClick,
  onTradeDayClick,
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const dailyResults = useMemo(() => {
    return trades.reduce((results, trade) => {
      if (!trade.date) {
        return results;
      }

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

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startingWeekDay = firstDayOfMonth.getDay();

    const days = [];

    for (let index = 0; index < startingWeekDay; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(day);
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [year, month]);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const todayDateKey = getLocalDateKey(new Date());

  function previousMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function goToCurrentMonth() {
    const today = new Date();

    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
  }

  function createDateKey(day) {
    const monthNumber = String(month + 1).padStart(2, "0");
    const dayNumber = String(day).padStart(2, "0");

    return `${year}-${monthNumber}-${dayNumber}`;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
      <div className="flex flex-col gap-4 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div>
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Trading Calendar
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
            Green days were profitable. Red days finished negative.
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <CalendarButton
            onClick={previousMonth}
            label="Previous month"
          >
            ←
          </CalendarButton>

          <button
            type="button"
            onClick={goToCurrentMonth}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white sm:flex-none"
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

      <div className="px-2 py-4 sm:px-6 sm:py-5">
        <h3 className="mb-4 text-center text-base font-semibold text-slate-200 sm:mb-5 sm:text-lg">
          {monthName}
        </h3>

        <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-800">
          {WEEK_DAYS.map((weekDay, index) => (
            <div
              key={weekDay}
              className={`border-b border-slate-800 bg-slate-950 px-0.5 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:px-1 sm:py-3 sm:text-sm ${
                index < WEEK_DAYS.length - 1
                  ? "border-r"
                  : ""
              }`}
            >
              <span className="sm:hidden">
                {weekDay.charAt(0)}
              </span>

              <span className="hidden sm:inline">
                {weekDay}
              </span>
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const isLastColumn = index % 7 === 6;
            const isLastRow =
              index >= calendarDays.length - 7;

            const borderClasses = [
              !isLastColumn ? "border-r" : "",
              !isLastRow ? "border-b" : "",
            ]
              .filter(Boolean)
              .join(" ");

            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className={`min-h-[76px] min-w-0 border-slate-800 bg-slate-950/40 sm:min-h-32 ${borderClasses}`}
                />
              );
            }

            const dateKey = createDateKey(day);
            const dayResult = dailyResults[dateKey];

            const profit = dayResult?.profit ?? 0;
            const tradeCount = dayResult?.tradeCount ?? 0;
            const isToday = dateKey === todayDateKey;

            let dayStyle =
              "bg-slate-900 hover:bg-slate-800";

            if (dayResult && profit > 0) {
              dayStyle =
                "bg-emerald-500/20 ring-1 ring-inset ring-emerald-400/40 hover:bg-emerald-500/30";
            }

            if (dayResult && profit < 0) {
              dayStyle =
                "bg-red-500/20 ring-1 ring-inset ring-red-400/40 hover:bg-red-500/30";
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
                    onTradeDayClick(
                      dateKey,
                      dayResult.trades
                    );
                  } else {
                    onEmptyDayClick(dateKey);
                  }
                }}
                className={`min-h-[76px] min-w-0 overflow-hidden border-slate-800 p-1 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:min-h-32 sm:p-3 ${borderClasses} ${dayStyle}`}
                aria-label={
                  dayResult
                    ? `View ${tradeCount} ${
                        tradeCount === 1
                          ? "trade"
                          : "trades"
                      } from ${dateKey}. Daily result ${formatSignedMoney(
                        profit
                      )}.`
                    : `Add a trade for ${dateKey}`
                }
              >
                <div className="flex min-w-0 items-start justify-between gap-0.5 sm:gap-1">
                  <span
                    className={`shrink-0 text-xs font-semibold sm:text-base ${
                      isToday
                        ? "rounded-md bg-blue-600 px-1.5 py-0.5 text-white"
                        : "text-slate-300"
                    }`}
                  >
                    {day}
                  </span>

                  {tradeCount > 0 && (
                    <span className="shrink-0 rounded-full bg-black/20 px-1 py-0.5 text-[8px] leading-none text-slate-300 sm:px-2 sm:text-xs">
                      {tradeCount}
                    </span>
                  )}
                </div>

                {dayResult && (
                  <div className="mt-2 min-w-0 overflow-hidden sm:mt-4">
                    <p
                      title={formatSignedMoney(profit)}
                      className={`block max-w-full truncate whitespace-nowrap text-[9px] font-bold leading-tight tabular-nums sm:text-sm md:text-base ${
                        profit > 0
                          ? "text-emerald-300"
                          : profit < 0
                            ? "text-red-300"
                            : "text-slate-300"
                      }`}
                    >
                      {formatCompactMoney(profit)}
                    </p>

                    <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                      {tradeCount}{" "}
                      {tradeCount === 1
                        ? "trade"
                        : "trades"}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 sm:mt-5 sm:gap-5 sm:text-sm">
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

function CalendarButton({
  onClick,
  label,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function CalendarKey({ className, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 shrink-0 rounded sm:h-3.5 sm:w-3.5 ${className}`}
      />

      <span>{label}</span>
    </div>
  );
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCompactMoney(amount) {
  const number = Number(amount || 0);
  const absoluteAmount = Math.abs(number);

  let formatted;

  if (absoluteAmount >= 1000) {
    formatted = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits:
        absoluteAmount < 10000 ? 1 : 0,
    }).format(absoluteAmount);

    formatted = `$${formatted}`;
  } else {
    formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absoluteAmount);
  }

  if (number > 0) {
    return `+${formatted}`;
  }

  if (number < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

function formatSignedMoney(amount) {
  const number = Number(amount || 0);

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(number));

  if (number > 0) {
    return `+${formatted}`;
  }

  if (number < 0) {
    return `-${formatted}`;
  }

  return formatted;
}