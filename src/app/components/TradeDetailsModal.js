"use client";

import { calculateProfit, calculateCommission } from "@/app/lib/calculations";

export default function TradeDetailsModal({ trade, closeModal, onEditTrade }) {
  if (!trade) return null;

  const profit = calculateProfit(trade);
const commission = calculateCommission(trade);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Trade Details
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              {trade.ticker} {trade.direction}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {formatDate(trade.date)}
            </p>
          </div>

<div className="flex gap-2">
  <button
    type="button"
    onClick={() => onEditTrade(trade)}
    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={closeModal}
    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
  >
    Close
  </button>
</div>

        </div>

        <div className="p-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Detail
              label="Entry Price"
              value={formatMoney(trade.entryPrice)}
            />

            <Detail
              label="Exit Price"
              value={formatMoney(trade.exitPrice)}
            />

            <Detail label="Contracts" value={trade.contracts} />

           <Detail
                label="Automatic Commission"
                value={formatMoney(commission)}
            />

            <Detail
              label="Other Fees"
              value={formatMoney(trade.fees || 0)}
            />

            <Detail
              label="Setup"
              value={trade.setup || "Not specified"}
            />

            <Detail
              label="Profit/Loss"
              value={formatSignedMoney(profit)}
              valueClass={
                profit > 0
                  ? "text-emerald-400"
                  : profit < 0
                    ? "text-red-400"
                    : "text-slate-100"
              }
            />
          </div>

          <div>
            <h3 className="mb-3 text-lg font-bold text-white">
              Trade Notes
            </h3>

            <div className="min-h-32 whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-800 p-4 leading-7 text-slate-300">
              {trade.notes || "No notes added for this trade."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  valueClass = "text-slate-100",
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function formatSignedMoney(amount) {
  const number = Number(amount || 0);
  const formatted = formatMoney(Math.abs(number));

  if (number > 0) return `+${formatted}`;
  if (number < 0) return `-${formatted}`;

  return formatted;
}

function formatDate(dateString) {
  if (!dateString) return "No date";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}