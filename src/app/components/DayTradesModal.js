"use client";

import { useEffect, useMemo } from "react";
import { calculateProfit } from "@/app/lib/calculations";

export default function DayTradesModal({
  date,
  trades = [],
  onSelectTrade,
  closeModal,
}) {
  const dailyProfit = useMemo(() => {
    return trades.reduce((total, trade) => {
      const profit = Number(calculateProfit(trade));

      return total + (Number.isFinite(profit) ? profit : 0);
    }, 0);
  }, [trades]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeModal]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-trades-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 sm:max-h-[92dvh]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
              Daily Trades
            </p>

            <h2
              id="day-trades-title"
              className="mt-1 text-xl font-bold text-white"
            >
              {formatDate(date)}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {trades.length}{" "}
              {trades.length === 1 ? "trade" : "trades"}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white sm:px-4"
            aria-label="Close daily trades"
          >
            Close
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <DailyProfitSummary profit={dailyProfit} />

          {trades.length > 0 ? (
            <div className="mt-4 space-y-3">
              {trades.map((trade, index) => {
                const profit =
                  Number(calculateProfit(trade)) || 0;

                return (
                  <TradeButton
                    key={trade.id || `${trade.ticker}-${index}`}
                    trade={trade}
                    profit={profit}
                    onClick={() => onSelectTrade(trade)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        <footer className="shrink-0 border-t border-slate-800 bg-slate-900 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={closeModal}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

function DailyProfitSummary({ profit }) {
  const isProfit = profit > 0;
  const isLoss = profit < 0;

  return (
    <section
      className={`relative overflow-hidden rounded-xl border p-4 ${
        isProfit
          ? "border-emerald-500/30 bg-emerald-500/10"
          : isLoss
            ? "border-red-500/30 bg-red-500/10"
            : "border-slate-700 bg-slate-800/60"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${
          isProfit
            ? "bg-emerald-500"
            : isLoss
              ? "bg-red-500"
              : "bg-slate-600"
        }`}
      />

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Daily Profit/Loss
      </p>

      <p
        className={`mt-1 truncate whitespace-nowrap text-2xl font-bold tabular-nums sm:text-3xl ${
          isProfit
            ? "text-emerald-400"
            : isLoss
              ? "text-red-400"
              : "text-slate-100"
        }`}
        title={formatSignedMoney(profit)}
      >
        {formatSignedMoney(profit)}
      </p>
    </section>
  );
}

function TradeButton({
  trade,
  profit,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-left transition hover:border-blue-500/50 hover:bg-slate-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="max-w-[160px] truncate text-lg font-bold text-white sm:max-w-[240px]">
              {trade.ticker || "No ticker"}
            </p>

            <DirectionBadge direction={trade.direction} />
          </div>

          <p
            className="mt-2 truncate text-sm text-slate-400"
            title={trade.setup || "No setup"}
          >
            {trade.setup || "No setup"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatContractCount(trade.contracts)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`whitespace-nowrap font-bold tabular-nums ${
              profit > 0
                ? "text-emerald-400"
                : profit < 0
                  ? "text-red-400"
                  : "text-slate-300"
            }`}
          >
            {formatSignedMoney(profit)}
          </p>

          <p className="mt-2 text-xs font-medium text-blue-400 opacity-80 transition group-hover:opacity-100">
            View details →
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
        <TradeDetail
          label="Entry"
          value={formatMoney(trade.entryPrice)}
        />

        <TradeDetail
          label="Exit"
          value={formatMoney(trade.exitPrice)}
        />
      </div>
    </button>
  );
}

function DirectionBadge({ direction }) {
  let badgeClass =
    "bg-slate-700/60 text-slate-300";

  if (direction === "CALL") {
    badgeClass =
      "bg-emerald-500/10 text-emerald-400";
  }

  if (direction === "PUT") {
    badgeClass =
      "bg-red-500/10 text-red-400";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
    >
      {direction || "—"}
    </span>
  );
}

function TradeDetail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-200 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-lg font-semibold text-slate-300">
        No trades found
      </p>

      <p className="mt-1 text-sm text-slate-500">
        There are no saved trades for this date.
      </p>
    </div>
  );
}

function formatContractCount(contracts) {
  const count = Number(contracts || 0);

  return `${count} ${count === 1 ? "contract" : "contracts"}`;
}

function formatMoney(amount) {
  const number = Number(amount);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(number) ? number : 0);
}

function formatSignedMoney(amount) {
  const number = Number(amount);

  if (!Number.isFinite(number) || number === 0) {
    return "$0.00";
  }

  const formatted = formatMoney(Math.abs(number));

  return number > 0
    ? `+${formatted}`
    : `-${formatted}`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "No date";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}