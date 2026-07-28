"use client";

import { useEffect } from "react";

import {
  calculateCommission,
  calculateProfit,
} from "@/app/lib/calculations";

export default function TradeDetailsModal({
  trade,
  closeModal,
  onEditTrade,
}) {
  useEffect(() => {
    if (!trade) return undefined;

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
  }, [trade, closeModal]);

  if (!trade) return null;

  const profit = Number(calculateProfit(trade)) || 0;
  const commission = Number(calculateCommission(trade)) || 0;
  const otherFees = Number(trade.fees || 0);
  const totalCosts = commission + otherFees;

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
        aria-labelledby="trade-details-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 sm:max-h-[92dvh]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
              Trade Details
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2
                id="trade-details-title"
                className="max-w-full truncate text-xl font-bold text-white sm:text-2xl"
              >
                {trade.ticker || "No Ticker"}
              </h2>

              <DirectionBadge direction={trade.direction} />
            </div>

            <p className="mt-1 text-sm text-slate-400">
              {formatDate(trade.date)}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white sm:px-4"
            aria-label="Close trade details"
          >
            Close
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <ProfitSummary profit={profit} />

          <section className="mt-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Trade Information
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <DetailCard
                label="Entry Price"
                value={formatMoney(trade.entryPrice)}
              />

              <DetailCard
                label="Exit Price"
                value={formatMoney(trade.exitPrice)}
              />

              <DetailCard
                label="Contracts"
                value={trade.contracts || 0}
              />

              <DetailCard
                label="Setup"
                value={trade.setup || "Not specified"}
                allowWrap
              />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Trading Costs
            </h3>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
              <CostRow
                label="Automatic Commission"
                value={formatMoney(commission)}
              />

              <CostRow
                label="Other Fees"
                value={formatMoney(otherFees)}
              />

              <CostRow
                label="Total Costs"
                value={formatMoney(totalCosts)}
                emphasis
              />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Trade Notes
            </h3>

            <div className="min-h-32 whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm leading-7 text-slate-300">
              {trade.notes || "No notes were added for this trade."}
            </div>
          </section>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-800 bg-slate-900 px-4 py-4 sm:flex sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onEditTrade(trade)}
            className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
          >
            Edit Trade
          </button>
        </footer>
      </div>
    </div>
  );
}

function ProfitSummary({ profit }) {
  const isProfit = profit > 0;
  const isLoss = profit < 0;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        isProfit
          ? "border-emerald-500/30 bg-emerald-500/10"
          : isLoss
            ? "border-red-500/30 bg-red-500/10"
            : "border-slate-700 bg-slate-800/60"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          isProfit
            ? "bg-emerald-500"
            : isLoss
              ? "bg-red-500"
              : "bg-slate-600"
        }`}
      />

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Net Profit/Loss
      </p>

      <p
        className={`mt-2 truncate whitespace-nowrap text-3xl font-bold tracking-tight tabular-nums sm:text-4xl ${
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

      <p className="mt-2 text-xs text-slate-500">
        Includes automatic commission and other fees.
      </p>
    </section>
  );
}

function DirectionBadge({ direction }) {
  const isCall = direction === "CALL";
  const isPut = direction === "PUT";

  let badgeClass =
    "bg-slate-700/60 text-slate-300";

  if (isCall) {
    badgeClass =
      "bg-emerald-500/10 text-emerald-400";
  }

  if (isPut) {
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

function DetailCard({
  label,
  value,
  allowWrap = false,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/40 p-3 sm:p-4">
      <p className="text-xs text-slate-500 sm:text-sm">
        {label}
      </p>

      <p
        className={`mt-1 font-bold text-slate-100 tabular-nums ${
          allowWrap
            ? "break-words"
            : "truncate whitespace-nowrap"
        }`}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}

function CostRow({
  label,
  value,
  emphasis = false,
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 last:border-b-0 ${
        emphasis ? "bg-slate-800/60" : ""
      }`}
    >
      <span
        className={
          emphasis
            ? "font-semibold text-slate-200"
            : "text-sm text-slate-400"
        }
      >
        {label}
      </span>

      <span
        className={`shrink-0 whitespace-nowrap tabular-nums ${
          emphasis
            ? "font-bold text-white"
            : "text-sm font-medium text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
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