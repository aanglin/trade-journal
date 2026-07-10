"use client";

import { useState } from "react";
import { calculateProfit } from "@/app/lib/calculations";

export default function TradeTable({ trades, deleteTrade }) {
  const [selectedTrade, setSelectedTrade] = useState(null);

  return (
    <>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-xl font-bold text-white">
            Trade History
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Review your saved trades and journal notes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-950/60">
              <tr className="border-b border-slate-800">
                <TableHeading>Date</TableHeading>
                <TableHeading>Ticker</TableHeading>
                <TableHeading>Type</TableHeading>
                <TableHeading>Setup</TableHeading>
                <TableHeading>Entry</TableHeading>
                <TableHeading>Exit</TableHeading>
                <TableHeading>Contracts</TableHeading>
                <TableHeading>P/L</TableHeading>
                <TableHeading>Actions</TableHeading>
              </tr>
            </thead>

            <tbody>
              {trades.map((trade) => {
                const profit = calculateProfit(trade);

                return (
                  <tr
                    key={trade.id}
                    className="border-b border-slate-800 transition last:border-b-0 hover:bg-slate-800/70"
                  >
                    <TableCell>{formatDate(trade.date)}</TableCell>

                    <TableCell>
                      <span className="font-bold text-white">
                        {trade.ticker}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          trade.direction === "CALL"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </TableCell>

                    <TableCell>{trade.setup}</TableCell>

                    <TableCell>
                      {formatMoney(trade.entryPrice)}
                    </TableCell>

                    <TableCell>
                      {formatMoney(trade.exitPrice)}
                    </TableCell>

                    <TableCell>{trade.contracts}</TableCell>

                    <TableCell>
                      <span
                        className={`font-bold ${
                          profit > 0
                            ? "text-emerald-400"
                            : profit < 0
                              ? "text-red-400"
                              : "text-slate-300"
                        }`}
                      >
                        {formatSignedMoney(profit)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTrade(trade)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteTrade(trade.id)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {trades.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-semibold text-slate-300">
                No trades added yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add your first trade to begin tracking your results.
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedTrade && (
        <TradeDetails
          trade={selectedTrade}
          closeDetails={() => setSelectedTrade(null)}
        />
      )}
    </>
  );
}

function TradeDetails({ trade, closeDetails }) {
  const profit = calculateProfit(trade);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closeDetails();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50">
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

          <button
            type="button"
            onClick={closeDetails}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Close
          </button>
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

            <Detail
              label="Contracts"
              value={trade.contracts}
            />

            <Detail
              label="Option Commission"
              value={formatMoney(trade.commission || 0)}
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

      <p className={`mt-1 font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function TableHeading({ children }) {
  return (
    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="px-4 py-4 text-sm text-slate-300">
      {children}
    </td>
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
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}