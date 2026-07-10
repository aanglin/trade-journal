"use client";

import { calculateProfit } from "@/app/lib/calculations";

export default function DayTradesModal({
  date,
  trades,
  onSelectTrade,
  closeModal,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Daily Trades
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              {formatDate(date)}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 p-6">
          {trades.map((trade) => {
            const profit = calculateProfit(trade);

            return (
              <button
                key={trade.id}
                type="button"
                onClick={() => onSelectTrade(trade)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-4 text-left transition hover:border-blue-500 hover:bg-slate-700"
              >
                <div>
                  <p className="font-bold text-white">
                    {trade.ticker} {trade.direction}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {trade.setup || "No setup"} · {trade.contracts}{" "}
                    {Number(trade.contracts) === 1
                      ? "contract"
                      : "contracts"}
                  </p>
                </div>

                <p
                  className={`font-bold ${
                    profit > 0
                      ? "text-emerald-400"
                      : profit < 0
                        ? "text-red-400"
                        : "text-slate-300"
                  }`}
                >
                  {formatSignedMoney(profit)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
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

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}