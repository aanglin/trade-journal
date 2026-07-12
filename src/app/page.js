"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/app/components/DashboardCard";
import TradeForm from "@/app/components/TradeForm";
import TradeTable from "@/app/components/TradeTable";
import TradeCalendar from "@/app/components/TradeCalendar";
import TradeDetailsModal from "@/app/components/TradeDetailsModal";
import DayTradesModal from "@/app/components/DayTradesModal";
import { signOut } from "firebase/auth";

import AuthScreen from "./components/AuthScreen";
import { useAuth } from "./context/AuthContext";
import { auth } from "@/app/lib/firebase";

import {
  addUserTrade,
  createUserProfile,
  deleteUserTrade,
  getUserSettings,
  getUserTrades,
  saveUserSettings,
  updateUserTrade,
} from "@/app/lib/firestore";

import {
  totalProfit,
  currentBalance,
  winRate,
  averageWinner,
  averageLoser,
  profitFactor,
  profitByPeriod,
} from "@/app/lib/calculations";



const emptyForm = {
  ticker: "",
  date: "",
  direction: "CALL",
  entryPrice: "",
  exitPrice: "",
  contracts: "1",
  fees: "",
  setup: "Opening Range Breakout",
  notes: "",
};

export default function Home() {
  const [trades, setTrades] = useState([]);
const { user, authLoading } = useAuth();
const [dataLoading, setDataLoading] = useState(true);
  const [settings, setSettings] = useState({
    startingBalance: "",
    accountInitialized: false,
  });
  const [editingTrade, setEditingTrade] = useState(null);
const [tradeSubmitting, setTradeSubmitting] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsBalance, setSettingsBalance] = useState("");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedDay, setSelectedDay] = useState({
  date: "",
  trades: [],
});
const [tradeHistoryCollapsed, setTradeHistoryCollapsed] = useState(false);

function openEditTrade(trade) {
  setEditingTrade(trade);

  setForm({
    ticker: trade.ticker ?? "",
    date: trade.date ?? "",
    direction: trade.direction ?? "CALL",
    entryPrice: String(trade.entryPrice ?? ""),
    exitPrice: String(trade.exitPrice ?? ""),
    contracts: String(trade.contracts ?? "1"),
    fees: String(trade.fees ?? ""),
    setup: trade.setup ?? "Opening Range Breakout",
    notes: trade.notes ?? "",
  });

  setSelectedTrade(null);
  setShowTradeModal(true);
}

function openAddTradeForDate(date) {
  setEditingTrade(null);

  setForm({
    ...emptyForm,
    date,
  });

  setShowTradeModal(true);
}

function openCalendarTrades(date, dayTrades) {
  if (dayTrades.length === 1) {
    setSelectedTrade(dayTrades[0]);
    return;
  }

  setSelectedDay({
    date,
    trades: dayTrades,
  });
}

function selectTradeFromDay(trade) {
  setSelectedDay({
    date: "",
    trades: [],
  });

  setSelectedTrade(trade);
}

useEffect(() => {
  if (!user) {
    setTrades([]);
    setDataLoading(false);
    return;
  }

  let active = true;

  async function loadUserData() {
    setDataLoading(true);

    try {
      await createUserProfile(user);

      const [savedTrades, savedSettings] =
        await Promise.all([
          getUserTrades(user.uid),
          getUserSettings(user.uid),
        ]);

      if (!active) return;

      setTrades(savedTrades);

      setSettings({
        startingBalance:
          savedSettings.startingBalance ?? "",
        accountInitialized:
          savedSettings.accountInitialized ?? false,
      });
    } catch (error) {
      console.error("Unable to load user data:", error);
    } finally {
      if (active) {
        setDataLoading(false);
      }
    }
  }

  loadUserData();

  return () => {
    active = false;
  };
}, [user]);

async function saveTrade(event) {
  event.preventDefault();

  if (!user || tradeSubmitting) {
    return;
  }

  

  const tradeToSave = {
    ticker: form.ticker.trim().toUpperCase(),
    date: form.date,
    direction: form.direction,
    entryPrice: Number(form.entryPrice),
    exitPrice: Number(form.exitPrice),
    contracts: Number(form.contracts),
    fees: Number(form.fees || 0),
    setup: form.setup || "",
    notes: form.notes || "",
  };

  setTradeSubmitting(true);

  try {
    if (editingTrade) {
      await updateUserTrade(
        user.uid,
        editingTrade.id,
        tradeToSave
      );

      setTrades((currentTrades) =>
        currentTrades.map((trade) =>
          trade.id === editingTrade.id
            ? {
                ...trade,
                ...tradeToSave,
              }
            : trade
        )
      );
    } else {
      const savedTrade = await addUserTrade(
        user.uid,
        tradeToSave
      );

      setTrades((currentTrades) => [
        savedTrade,
        ...currentTrades,
      ]);
    }

    setForm(emptyForm);
    setEditingTrade(null);
    setShowTradeModal(false);
  } catch (error) {
    console.error(
      editingTrade
        ? "Unable to update trade:"
        : "Unable to save trade:",
      error
    );
  } finally {
    setTradeSubmitting(false);
  }
}

  async function deleteTrade(tradeId) {
  if (!user) return;

  try {
    await deleteUserTrade(user.uid, tradeId);

    setTrades((currentTrades) =>
      currentTrades.filter(
        (trade) => trade.id !== tradeId
      )
    );
  } catch (error) {
    console.error("Unable to delete trade:", error);
  }
}

function openTradeModal() {
  setEditingTrade(null);

  setForm({
    ...emptyForm,
    date: new Date().toLocaleDateString("en-CA"),
  });

  setShowTradeModal(true);
}
  

  function openSettingsModal() {
    setSettingsBalance(settings.startingBalance ?? "");
    setShowSettingsModal(true);
  }

  async function saveStartingBalance(event) {
  event.preventDefault();

  if (!user) return;

  const balance = Number(settingsBalance);

  if (!Number.isFinite(balance) || balance < 0) {
    return;
  }

  const updatedSettings = {
    startingBalance: balance,
    accountInitialized: true,
  };

  try {
    await saveUserSettings(
      user.uid,
      updatedSettings
    );

    setSettings(updatedSettings);
    setShowSettingsModal(false);
  } catch (error) {
    console.error(
      "Unable to save account settings:",
      error
    );
  }
}

  const netPL = totalProfit(trades);

  const startingBalance = Number(settings.startingBalance || 0);

  const balance = currentBalance(startingBalance, trades);
  const todayPL = profitByPeriod(trades, "today");
  const weekPL = profitByPeriod(trades, "week");
  const monthPL = profitByPeriod(trades, "month");

  const returnPercentage =
    startingBalance > 0 ? (netPL / startingBalance) * 100 : 0;

    if (authLoading) {
  return <LoadingScreen message="Checking account..." />;
}

if (!user) {
  return <AuthScreen />;
}

if (dataLoading) {
  return <LoadingScreen message="Loading trading journal..." />;
}


  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              Trading Dashboard
            </p>

           <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
  {user.displayName
    ? `${user.displayName}'s Trading Journey`
    : "My Trading Journey"}
</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openSettingsModal}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Settings
            </button>

            <button
              type="button"
              onClick={openTradeModal}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Add Trade
            </button>
            <button
  type="button"
  onClick={() => signOut(auth)}
  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
>
  Sign Out
</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardCard
            title="Current Balance"
            value={formatMoney(balance)}
            subtitle={`${formatPercentage(returnPercentage)} since start`}
            emphasis
          />

          <DashboardCard
            title="Net Profit/Loss"
            value={formatSignedMoney(netPL)}
            profit={netPL}
          />

          <DashboardCard
            title="Today's P/L"
            value={formatSignedMoney(todayPL)}
            profit={todayPL}
          />

          <DashboardCard
            title="This Week"
            value={formatSignedMoney(weekPL)}
            profit={weekPL}
          />

          <DashboardCard
            title="This Month"
            value={formatSignedMoney(monthPL)}
            profit={monthPL}
          />

          <DashboardCard
            title="Win Rate"
            value={`${winRate(trades)}%`}
          />

          <DashboardCard
            title="Total Trades"
            value={trades.length}
          />

          <DashboardCard
            title="Average Winner"
            value={formatMoney(averageWinner(trades))}
            profit={averageWinner(trades)}
          />

          <DashboardCard
            title="Average Loser"
            value={formatMoney(averageLoser(trades))}
            profit={averageLoser(trades)}
          />

          <DashboardCard
            title="Profit Factor"
            value={profitFactor(trades).toFixed(2)}
          />
        </section>

        <TradeCalendar trades={trades}
        onTradeDayClick={openCalendarTrades}
        onEmptyDayClick={openAddTradeForDate}
     />

        <TradeTable
          trades={trades}
          deleteTrade={deleteTrade}
          onViewTrade={setSelectedTrade}
          onEditTrade={openEditTrade}
          collapsed={tradeHistoryCollapsed}
          setCollapsed={setTradeHistoryCollapsed}
        />
      </div>

      {!settings.accountInitialized && (
        <BalanceSetupModal
          balance={settingsBalance}
          setBalance={setSettingsBalance}
          saveBalance={saveStartingBalance}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          balance={settingsBalance}
          setBalance={setSettingsBalance}
          saveBalance={saveStartingBalance}
          closeModal={() => setShowSettingsModal(false)}
        />
      )}

      {showTradeModal && (
        <TradeForm
         form={form}
  setForm={setForm}
  saveTrade={saveTrade}
  closeModal={() => {
    setShowTradeModal(false);
    setEditingTrade(null);
    setForm(emptyForm);
  }}
  isEditing={Boolean(editingTrade)}
  submitting={tradeSubmitting}
        />
      )}
      {selectedDay.trades.length > 0 && (
  <DayTradesModal
    date={selectedDay.date}
    trades={selectedDay.trades}
    onSelectTrade={selectTradeFromDay}
    closeModal={() =>
      setSelectedDay({
        date: "",
        trades: [],
      })
    }
  />
)}

{selectedTrade && (
  <TradeDetailsModal
    trade={selectedTrade}
    closeModal={() => setSelectedTrade(null)}
    onEditTrade={openEditTrade}
  />
)}
    </main>
  );
}

function BalanceSetupModal({
  balance,
  setBalance,
  saveBalance,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          Account Setup
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Enter your starting balance
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          This is used to calculate your current balance and total return.
          You can change it later in Settings.
        </p>

        <form onSubmit={saveBalance} className="mt-6">
          <label
            htmlFor="initialBalance"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Starting Balance
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              $
            </span>

            <input
              id="initialBalance"
              type="number"
              min="0"
              step="0.01"
              autoFocus
              required
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-8 pr-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="600.00"
            />
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Save Starting Balance
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsModal({
  balance,
  setBalance,
  saveBalance,
  closeModal,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Account
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Settings
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <form onSubmit={saveBalance} className="p-6">
          <label
            htmlFor="settingsBalance"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Starting Balance
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              $
            </span>

            <input
              id="settingsBalance"
              type="number"
              min="0"
              step="0.01"
              required
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-8 pr-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Changing this value will recalculate your current balance and
            return percentage. It will not change your saved trades.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
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

function formatPercentage(amount) {
  const number = Number(amount || 0);

  if (number > 0) return `+${number.toFixed(2)}%`;
  if (number < 0) return `${number.toFixed(2)}%`;

  return "0.00%";
}

function LoadingScreen({ message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

        <p className="mt-4 text-sm text-slate-400">
          {message}
        </p>
      </div>
    </main>
  );
}




