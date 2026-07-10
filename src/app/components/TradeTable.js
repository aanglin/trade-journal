"use client";

import { calculateProfit } from "@/app/lib/calculations";

export default function TradeTable({
  trades,
  deleteTrade,
  onViewTrade,
}) {
  return (
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
        {trades.length > 0 ? (
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
                    <TableCell>
                      {formatDate(trade.date)}
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-white">
                        {trade.ticker || "—"}
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
                        {trade.direction || "—"}
                      </span>
                    </TableCell>

                    <TableCell>
                      {trade.setup || "Not specified"}
                    </TableCell>

                    <TableCell>
                      {formatMoney(trade.entryPrice)}
                    </TableCell>

                    <TableCell>
                      {formatMoney(trade.exitPrice)}
                    </TableCell>

                    <TableCell>
                      {trade.contracts || 0}
                    </TableCell>

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
                          onClick={() => onViewTrade(trade)}
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
        ) : (
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
  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
}

function formatSignedMoney(amount) {
  const number = Number(amount);

  if (!Number.isFinite(number) || number === 0) {
    return "$0.00";
  }

  const formatted = formatMoney(Math.abs(number));

  return number > 0 ? `+${formatted}` : `-${formatted}`;
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}