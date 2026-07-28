"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";

import DashboardCard from "@/app/components/DashboardCard";
import TradeForm from "@/app/components/TradeForm";
import TradeTable from "@/app/components/TradeTable";
import TradeCalendar from "@/app/components/TradeCalendar";
import TradeDetailsModal from "@/app/components/TradeDetailsModal";
import DayTradesModal from "@/app/components/DayTradesModal";

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
  averageLoser,
  averageWinner,
  currentBalance,
  profitByPeriod,
  profitFactor,
  totalProfit,
  winRate,
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

const defaultSettings = {
  startingBalance: "",
  accountInitialized: false,
  tradeHistoryCollapsed: false,
};

export default function Home() {
  const { user, authLoading } = useAuth();

  const [trades, setTrades] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

  const [form, setForm] = useState(emptyForm);
  const [editingTrade, setEditingTrade] = useState(null);
  const [tradeSubmitting, setTradeSubmitting] = useState(false);

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsBalance, setSettingsBalance] = useState("");

  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedDay, setSelectedDay] = useState({
    date: "",
    trades: [],
  });

  const [tradeHistoryCollapsed, setTradeHistoryCollapsed] = useState(false);

  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState(() => {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!notice.message) return undefined;

    const timer = window.setTimeout(() => {
      setNotice({
        type: "",
        message: "",
      });
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
  if (!user) {
    return undefined;
  }

  let active = true;

  async function loadUserData() {
    try {
      await createUserProfile(user);

      const [savedTrades, savedSettings] =
        await Promise.all([
          getUserTrades(user.uid),
          getUserSettings(user.uid),
        ]);

      if (!active) return;

      const loadedSettings = {
        startingBalance:
          savedSettings.startingBalance ?? "",

        accountInitialized:
          savedSettings.accountInitialized ?? false,

        tradeHistoryCollapsed:
          savedSettings.tradeHistoryCollapsed ?? false,
      };

      setTrades(savedTrades);
      setSettings(loadedSettings);
      setSettingsBalance(
        loadedSettings.startingBalance
      );
      setTradeHistoryCollapsed(
        loadedSettings.tradeHistoryCollapsed
      );
    } catch (error) {
      console.error(
        "Unable to load user data:",
        error
      );

      if (!active) return;

      setNotice({
        type: "error",
        message:
          "Your trading journal could not be loaded. Please refresh and try again.",
      });
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
  const dashboardMetrics = useMemo(() => {
    const startingBalance = Number(settings.startingBalance || 0);
    const netPL = totalProfit(trades);
    const balance = currentBalance(startingBalance, trades);

    return {
      startingBalance,
      netPL,
      balance,
      todayPL: profitByPeriod(trades, "today"),
      weekPL: profitByPeriod(trades, "week"),
      monthPL: profitByPeriod(trades, "month"),
      returnPercentage:
        startingBalance > 0 ? (netPL / startingBalance) * 100 : 0,
      winRate: winRate(trades),
      averageWinner: averageWinner(trades),
      averageLoser: averageLoser(trades),
      profitFactor: profitFactor(trades),
      totalTrades: trades.length,
    };
  }, [settings.startingBalance, trades]);

  const selectedMonthTrades = useMemo(() => {
    const selectedYear = selectedCalendarMonth.getFullYear();
    const selectedMonth = selectedCalendarMonth.getMonth();

    return trades.filter((trade) => {
      if (!trade.date) return false;

      const tradeDate = new Date(`${trade.date}T00:00:00`);

      return (
        tradeDate.getFullYear() === selectedYear &&
        tradeDate.getMonth() === selectedMonth
      );
    });
  }, [selectedCalendarMonth, trades]);

  function showNotice(type, message) {
    setNotice({
      type,
      message,
    });
  }

  function clearNotice() {
    setNotice({
      type: "",
      message: "",
    });
  }

  const closeTradeModal = useCallback(() => {
  setShowTradeModal(false);
  setEditingTrade(null);
  setForm(emptyForm);
}, []);

  function openTradeModal() {
    setEditingTrade(null);

    setForm({
      ...emptyForm,
      date: getLocalDateString(),
    });

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

  function openSettingsModal() {
    setSettingsBalance(settings.startingBalance ?? "");
    setShowSettingsModal(true);
  }

  async function handleSignOut() {
  clearNotice();
  setDataLoading(true);

  try {
    await signOut(auth);
  } catch (error) {
    console.error(
      "Unable to sign out:",
      error
    );

    setDataLoading(false);

    showNotice(
      "error",
      "You could not be signed out. Please try again."
    );
  }
}

  async function toggleTradeHistory() {
    if (!user) return;

    const previousCollapsed = tradeHistoryCollapsed;
    const nextCollapsed = !previousCollapsed;

    const updatedSettings = {
      ...settings,
      tradeHistoryCollapsed: nextCollapsed,
    };

    setTradeHistoryCollapsed(nextCollapsed);
    setSettings(updatedSettings);

    try {
      await saveUserSettings(user.uid, updatedSettings);
    } catch (error) {
      console.error("Unable to save trade history preference:", error);

      setTradeHistoryCollapsed(previousCollapsed);
      setSettings((currentSettings) => ({
        ...currentSettings,
        tradeHistoryCollapsed: previousCollapsed,
      }));

      showNotice(
        "error",
        "Your Trade History preference could not be saved."
      );
    }
  }

  async function saveTrade(event) {
    event.preventDefault();

    if (!user || tradeSubmitting) return;

    const ticker = form.ticker.trim().toUpperCase();
    const entryPrice = Number(form.entryPrice);
    const exitPrice = Number(form.exitPrice);
    const contracts = Number(form.contracts);
    const fees = Number(form.fees || 0);

    if (!ticker || !form.date) {
      showNotice("error", "Enter a ticker and trade date.");
      return;
    }

    if (
      !Number.isFinite(entryPrice) ||
      !Number.isFinite(exitPrice) ||
      !Number.isFinite(contracts) ||
      contracts <= 0 ||
      !Number.isFinite(fees) ||
      fees < 0
    ) {
      showNotice("error", "Check the trade prices, contracts, and fees.");
      return;
    }

    const tradeToSave = {
      ticker,
      date: form.date,
      direction: form.direction,
      entryPrice,
      exitPrice,
      contracts,
      fees,
      setup: form.setup || "",
      notes: form.notes.trim(),
    };

    setTradeSubmitting(true);
    clearNotice();

    try {
      if (editingTrade) {
        await updateUserTrade(user.uid, editingTrade.id, tradeToSave);

        const updatedTrade = {
          ...editingTrade,
          ...tradeToSave,
        };

        setTrades((currentTrades) =>
          currentTrades.map((trade) =>
            trade.id === editingTrade.id ? updatedTrade : trade
          )
        );

        setSelectedTrade((currentTrade) =>
          currentTrade?.id === editingTrade.id ? updatedTrade : currentTrade
        );

        showNotice("success", "Trade updated successfully.");
      } else {
        const savedTrade = await addUserTrade(user.uid, tradeToSave);

        setTrades((currentTrades) => [savedTrade, ...currentTrades]);

        showNotice("success", "Trade saved successfully.");
      }

      closeTradeModal();
    } catch (error) {
      console.error(
        editingTrade ? "Unable to update trade:" : "Unable to save trade:",
        error
      );

      showNotice(
        "error",
        editingTrade
          ? "The trade could not be updated."
          : "The trade could not be saved."
      );
    } finally {
      setTradeSubmitting(false);
    }
  }

  async function deleteTrade(tradeId) {
    if (!user || !tradeId) return;

    const confirmed = window.confirm(
      "Delete this trade? This action cannot be undone."
    );

    if (!confirmed) return;

    clearNotice();

    try {
      await deleteUserTrade(user.uid, tradeId);

      setTrades((currentTrades) =>
        currentTrades.filter((trade) => trade.id !== tradeId)
      );

      setSelectedTrade((currentTrade) =>
        currentTrade?.id === tradeId ? null : currentTrade
      );

      setSelectedDay((currentDay) => ({
        ...currentDay,
        trades: currentDay.trades.filter((trade) => trade.id !== tradeId),
      }));

      showNotice("success", "Trade deleted.");
    } catch (error) {
      console.error("Unable to delete trade:", error);
      showNotice("error", "The trade could not be deleted.");
    }
  }

  async function saveStartingBalance(event) {
    event.preventDefault();

    if (!user) return;

    const balance = Number(settingsBalance);

    if (!Number.isFinite(balance) || balance < 0) {
      showNotice("error", "Enter a valid starting balance.");
      return;
    }

    const updatedSettings = {
      ...settings,
      startingBalance: balance,
      accountInitialized: true,
      tradeHistoryCollapsed,
    };

    clearNotice();

    try {
      await saveUserSettings(user.uid, updatedSettings);

      setSettings(updatedSettings);
      setSettingsBalance(balance);
      setShowSettingsModal(false);

      showNotice("success", "Account settings saved.");
    } catch (error) {
      console.error("Unable to save account settings:", error);
      showNotice("error", "Your account settings could not be saved.");
    }
  }

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
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              Trading Dashboard
            </p>

            <h1 className="mt-1 truncate text-2xl font-bold sm:text-3xl">
              {user.displayName
                ? `${user.displayName}'s Trading Journey`
                : "My Trading Journey"}
            </h1>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={openSettingsModal}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Settings
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Sign Out
            </button>

            <button
              type="button"
              onClick={openTradeModal}
              className="col-span-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:col-span-1 sm:order-none"
            >
              Add Trade
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
        {notice.message && (
          <NoticeBanner
            type={notice.type}
            message={notice.message}
            onClose={clearNotice}
          />
        )}

        <section className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
          <DashboardCard
            title="Current Balance"
            value={formatMoney(dashboardMetrics.balance)}
            subtitle={`${formatPercentage(
              dashboardMetrics.returnPercentage
            )} since start`}
            emphasis
          />

          <DashboardCard
            title="Net Profit/Loss"
            value={formatSignedMoney(dashboardMetrics.netPL)}
            profit={dashboardMetrics.netPL}
          />

          <DashboardCard
            title="Today's P/L"
            value={formatSignedMoney(dashboardMetrics.todayPL)}
            profit={dashboardMetrics.todayPL}
          />

          <DashboardCard
            title="This Week"
            value={formatSignedMoney(dashboardMetrics.weekPL)}
            profit={dashboardMetrics.weekPL}
          />

          <DashboardCard
            title="This Month"
            value={formatSignedMoney(dashboardMetrics.monthPL)}
            profit={dashboardMetrics.monthPL}
          />

          <DashboardCard
            title="Win Rate"
            value={`${dashboardMetrics.winRate}%`}
          />

          <DashboardCard
            title="Total Trades"
            value={dashboardMetrics.totalTrades}
          />

          <DashboardCard
            title="Average Winner"
            value={formatMoney(dashboardMetrics.averageWinner)}
            profit={dashboardMetrics.averageWinner}
          />

          <DashboardCard
            title="Average Loser"
            value={formatMoney(dashboardMetrics.averageLoser)}
            profit={dashboardMetrics.averageLoser}
          />

          <DashboardCard
            title="Profit Factor"
            value={formatProfitFactor(dashboardMetrics.profitFactor)}
          />
        </section>

        <div className="space-y-6">
          <TradeCalendar
            trades={trades}
            currentMonth={selectedCalendarMonth}
            setCurrentMonth={setSelectedCalendarMonth}
            onEmptyDayClick={openAddTradeForDate}
            onTradeDayClick={openCalendarTrades}
          />

          <TradeTable
            trades={selectedMonthTrades}
            deleteTrade={deleteTrade}
            onViewTrade={setSelectedTrade}
            onEditTrade={openEditTrade}
            collapsed={tradeHistoryCollapsed}
            onToggleCollapsed={toggleTradeHistory}
          />
        </div>
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
          closeModal={closeTradeModal}
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

function NoticeBanner({ type, message, onClose }) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-5 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      <p>{message}</p>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 font-semibold opacity-70 transition hover:opacity-100"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

function BalanceSetupModal({ balance, setBalance, saveBalance }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          Account Setup
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Enter your starting balance
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          This is used to calculate your current balance and total return. You
          can change it later in Settings.
        </p>

        <form onSubmit={saveBalance} className="mt-6">
          <MoneyInput
            id="initialBalance"
            label="Starting Balance"
            value={balance}
            setValue={setBalance}
            autoFocus
            placeholder="600.00"
          />

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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Account
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">Settings</h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <form onSubmit={saveBalance} className="p-5 sm:p-6">
          <MoneyInput
            id="settingsBalance"
            label="Starting Balance"
            value={balance}
            setValue={setBalance}
          />

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Changing this value recalculates your current balance and return
            percentage. It does not change your saved trades.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MoneyInput({
  id,
  label,
  value,
  setValue,
  autoFocus = false,
  placeholder = "",
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          $
        </span>

        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          autoFocus={autoFocus}
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-8 pr-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function LoadingScreen({ message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

        <p className="mt-4 text-sm text-slate-400">{message}</p>
      </div>
    </main>
  );
}

function getLocalDateString() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;

  return new Date(today.getTime() - timezoneOffset)
    .toISOString()
    .split("T")[0];
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

function formatProfitFactor(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value === Infinity ? "∞" : "0.00";
  }

  return number.toFixed(2);
}



