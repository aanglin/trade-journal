"use client";

import { useMemo } from "react";
import { calculateProfit } from "@/app/lib/calculations";

export default function TradeTable({
  trades = [],
  deleteTrade,
  onViewTrade,
  onEditTrade,
  collapsed,
  onToggleCollapsed,
}) {
  const sortedTrades = useMemo(() => {
    return [...trades].sort((firstTrade, secondTrade) => {
      const firstDate = firstTrade.date
        ? new Date(`${firstTrade.date}T00:00:00`).getTime()
        : 0;

      const secondDate = secondTrade.date
        ? new Date(`${secondTrade.date}T00:00:00`).getTime()
        : 0;

      return secondDate - firstDate;
    });
  }, [trades]);

  const monthlyProfit = useMemo(() => {
    return trades.reduce((total, trade) => {
      const profit = Number(calculateProfit(trade));

      return total + (Number.isFinite(profit) ? profit : 0);
    }, 0);
  }, [trades]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
      <button
        type="button"
        onClick={onToggleCollapsed}
        className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-800/40 sm:px-6 sm:py-5 ${
          collapsed ? "" : "border-b border-slate-800"
        }`}
        aria-expanded={!collapsed}
        aria-controls="trade-history-content"
      >
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Trade History
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
            <span className="text-slate-400">
              {trades.length}{" "}
              {trades.length === 1 ? "trade" : "trades"}
            </span>

            {trades.length > 0 && (
              <span
                className={`font-semibold ${
                  monthlyProfit > 0
                    ? "text-emerald-400"
                    : monthlyProfit < 0
                      ? "text-red-400"
                      : "text-slate-300"
                }`}
              >
                {formatSignedMoney(monthlyProfit)}
              </span>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 text-xl text-slate-400 transition-transform duration-300 sm:text-2xl ${
            collapsed ? "-rotate-90" : "rotate-0"
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          collapsed
            ? "grid-rows-[0fr]"
            : "grid-rows-[1fr]"
        }`}
      >
        <div
          id="trade-history-content"
          className="min-h-0 overflow-hidden"
        >
          {sortedTrades.length > 0 ? (
            <>
              <MobileTradeCards
                trades={sortedTrades}
                deleteTrade={deleteTrade}
                onViewTrade={onViewTrade}
                onEditTrade={onEditTrade}
              />

              <DesktopTradeTable
                trades={sortedTrades}
                deleteTrade={deleteTrade}
                onViewTrade={onViewTrade}
                onEditTrade={onEditTrade}
              />
            </>
          ) : (
            <EmptyTradeHistory />
          )}
        </div>
      </div>
    </section>
  );
}

function MobileTradeCards({
  trades,
  deleteTrade,
  onViewTrade,
  onEditTrade,
}) {
  return (
    <div className="divide-y divide-slate-800 md:hidden">
      {trades.map((trade) => {
        const profit = Number(calculateProfit(trade)) || 0;

        return (
          <article
            key={trade.id}
            className="p-4 transition hover:bg-slate-800/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="max-w-[160px] truncate text-lg font-bold text-white">
                    {trade.ticker || "No ticker"}
                  </h3>

                  <DirectionBadge
                    direction={trade.direction}
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(trade.date)}
                </p>
              </div>

              <span
                className={`shrink-0 whitespace-nowrap text-base font-bold tabular-nums ${
                  profit > 0
                    ? "text-emerald-400"
                    : profit < 0
                      ? "text-red-400"
                      : "text-slate-300"
                }`}
              >
                {formatSignedMoney(profit)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <MobileDetail
                label="Entry"
                value={formatMoney(trade.entryPrice)}
              />

              <MobileDetail
                label="Exit"
                value={formatMoney(trade.exitPrice)}
              />

              <MobileDetail
                label="Contracts"
                value={trade.contracts || 0}
              />

              <MobileDetail
                label="Fees"
                value={formatMoney(trade.fees)}
              />
            </div>

            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Setup
              </p>

              <p className="mt-1 line-clamp-2 text-sm text-slate-300">
                {trade.setup || "Not specified"}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <ActionButton
                onClick={() => onViewTrade(trade)}
                variant="neutral"
              >
                View
              </ActionButton>

              <ActionButton
                onClick={() => onEditTrade(trade)}
                variant="edit"
              >
                Edit
              </ActionButton>

              <ActionButton
                onClick={() => deleteTrade(trade.id)}
                variant="delete"
              >
                Delete
              </ActionButton>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function DesktopTradeTable({
  trades,
  deleteTrade,
  onViewTrade,
  onEditTrade,
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[1050px] text-left">
        <thead className="bg-slate-950/60">
          <tr className="border-b border-slate-800">
            <TableHeading>Date</TableHeading>
            <TableHeading>Ticker</TableHeading>
            <TableHeading>Type</TableHeading>
            <TableHeading>Setup</TableHeading>
            <TableHeading align="right">
              Entry
            </TableHeading>
            <TableHeading align="right">
              Exit
            </TableHeading>
            <TableHeading align="center">
              Contracts
            </TableHeading>
            <TableHeading align="right">
              P/L
            </TableHeading>
            <TableHeading>Actions</TableHeading>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => {
            const profit =
              Number(calculateProfit(trade)) || 0;

            return (
              <tr
                key={trade.id}
                className="border-b border-slate-800 transition last:border-b-0 hover:bg-slate-800/60"
              >
                <TableCell>
                  <span className="whitespace-nowrap">
                    {formatDate(trade.date)}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="font-bold text-white">
                    {trade.ticker || "—"}
                  </span>
                </TableCell>

                <TableCell>
                  <DirectionBadge
                    direction={trade.direction}
                  />
                </TableCell>

                <TableCell>
                  <span
                    className="block max-w-[220px] truncate"
                    title={trade.setup || "Not specified"}
                  >
                    {trade.setup || "Not specified"}
                  </span>
                </TableCell>

                <TableCell align="right">
                  <span className="whitespace-nowrap tabular-nums">
                    {formatMoney(trade.entryPrice)}
                  </span>
                </TableCell>

                <TableCell align="right">
                  <span className="whitespace-nowrap tabular-nums">
                    {formatMoney(trade.exitPrice)}
                  </span>
                </TableCell>

                <TableCell align="center">
                  {trade.contracts || 0}
                </TableCell>

                <TableCell align="right">
                  <span
                    className={`whitespace-nowrap font-bold tabular-nums ${
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
                    <ActionButton
                      onClick={() => onViewTrade(trade)}
                      variant="neutral"
                    >
                      View
                    </ActionButton>

                    <ActionButton
                      onClick={() => onEditTrade(trade)}
                      variant="edit"
                    >
                      Edit
                    </ActionButton>

                    <ActionButton
                      onClick={() => deleteTrade(trade.id)}
                      variant="delete"
                    >
                      Delete
                    </ActionButton>
                  </div>
                </TableCell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DirectionBadge({ direction }) {
  const isCall = direction === "CALL";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isCall
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      }`}
    >
      {direction || "—"}
    </span>
  );
}

function MobileDetail({ label, value }) {
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

function ActionButton({
  onClick,
  variant,
  children,
}) {
  const variants = {
    neutral:
      "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white",

    edit:
      "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",

    delete:
      "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
        variants[variant] || variants.neutral
      }`}
    >
      {children}
    </button>
  );
}

function EmptyTradeHistory() {
  return (
    <div className="px-5 py-12 text-center sm:px-6 sm:py-14">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xl">
        ↗
      </div>

      <p className="mt-4 text-lg font-semibold text-slate-300">
        No trades for this month
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
        Select a calendar day to add a trade, or move to a
        different month to review previous activity.
      </p>
    </div>
  );
}

function TableHeading({
  children,
  align = "left",
}) {
  const alignment = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th
      className={`px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
        alignment[align] || alignment.left
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
}) {
  const alignment = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      className={`px-4 py-4 text-sm text-slate-300 ${
        alignment[align] || alignment.left
      }`}
    >
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}