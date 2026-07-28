"use client";

import { useEffect, useRef } from "react";

import {
  calculateCommission,
  COMMISSION_PER_CONTRACT,
} from "@/app/lib/calculations";

const TRADE_SETUPS = [
  "Opening Range Breakout",
  "Support Bounce",
  "Resistance Rejection",
  "EMA Bounce",
  "Reversal",
  "Other",
];

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

export default function TradeForm({
  form,
  setForm,
  saveTrade,
  closeModal,
  isEditing,
  submitting,
}) {
  const tickerInputRef = useRef(null);

  const contractCount = Math.max(
    0,
    Number(form.contracts || 0)
  );

  const automaticCommission = calculateCommission({
    contracts: contractCount,
  });

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      tickerInputRef.current?.focus();
    }, 100);

    function handleEscape(event) {
      if (
        event.key === "Escape" &&
        !submitting
      ) {
        closeModal();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.clearTimeout(focusTimer);

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [closeModal, submitting]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        name === "ticker"
          ? value.toUpperCase()
          : value,
    }));
  }

  function handleBackdropClick(event) {
    if (
      event.target === event.currentTarget &&
      !submitting
    ) {
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
        aria-labelledby="trade-form-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 sm:max-h-[92dvh]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
              {isEditing
                ? "Update Journal Entry"
                : "New Journal Entry"}
            </p>

            <h2
              id="trade-form-title"
              className="mt-1 text-xl font-bold text-white sm:text-2xl"
            >
              {isEditing
                ? "Edit Trade"
                : "Add Trade"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={submitting}
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            aria-label="Close trade form"
          >
            Close
          </button>
        </header>

        <form
          onSubmit={saveTrade}
          className="flex min-h-0 flex-1 flex-col"
        >
          <fieldset
            disabled={submitting}
            className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-4 sm:p-6 md:grid-cols-2"
          >
            <FormField
              id="ticker"
              label="Ticker"
              required
            >
              <input
                ref={tickerInputRef}
                id="ticker"
                className={inputClass}
                name="ticker"
                type="text"
                maxLength={10}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder="SPY"
                value={form.ticker ?? ""}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField
              id="date"
              label="Trade Date"
              required
            >
              <input
                id="date"
                className={inputClass}
                name="date"
                type="date"
                value={form.date ?? ""}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField
              id="direction"
              label="Option Type"
              required
            >
              <select
                id="direction"
                className={inputClass}
                name="direction"
                value={form.direction ?? "CALL"}
                onChange={handleChange}
                required
              >
                <option value="CALL">Call</option>
                <option value="PUT">Put</option>
              </select>
            </FormField>

            <FormField
              id="contracts"
              label="Contracts"
              required
            >
              <input
                id="contracts"
                className={inputClass}
                name="contracts"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="1"
                value={form.contracts ?? "1"}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField
              id="entryPrice"
              label="Entry Price"
              required
              helpText="Price paid per option contract."
            >
              <MoneyInput
                id="entryPrice"
                name="entryPrice"
                value={form.entryPrice ?? ""}
                placeholder="2.95"
                onChange={handleChange}
              />
            </FormField>

            <FormField
              id="exitPrice"
              label="Exit Price"
              required
              helpText="Price received when closing."
            >
              <MoneyInput
                id="exitPrice"
                name="exitPrice"
                value={form.exitPrice ?? ""}
                placeholder="3.30"
                onChange={handleChange}
              />
            </FormField>

            <div className="md:col-span-2">
              <CommissionDisplay
                contracts={contractCount}
                commission={automaticCommission}
              />
            </div>

            <FormField
              id="fees"
              label="Other Fees"
              helpText="Enter fees not included in commission."
            >
              <MoneyInput
                id="fees"
                name="fees"
                value={form.fees ?? ""}
                placeholder="0.03"
                onChange={handleChange}
                required={false}
              />
            </FormField>

            <FormField
              id="setup"
              label="Trade Setup"
            >
              <select
                id="setup"
                className={inputClass}
                name="setup"
                value={
                  form.setup ??
                  "Opening Range Breakout"
                }
                onChange={handleChange}
              >
                {TRADE_SETUPS.map((setup) => (
                  <option
                    key={setup}
                    value={setup}
                  >
                    {setup}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField
                id="notes"
                label="Trade Notes"
                helpText="Record your reasoning, emotions, mistakes, and lessons."
              >
                <textarea
                  id="notes"
                  className={`${inputClass} min-h-36 resize-y leading-6`}
                  name="notes"
                  placeholder="Why did you enter? Did you follow your plan? What would you improve next time?"
                  value={form.notes ?? ""}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </fieldset>

          <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-800 bg-slate-900 px-4 py-4 sm:flex sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
              )}

              <span>
                {submitting
                  ? isEditing
                    ? "Updating..."
                    : "Saving..."
                  : isEditing
                    ? "Update Trade"
                    : "Save Trade"}
              </span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function FormField({
  id,
  label,
  required = false,
  helpText,
  children,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        {label}

        {required && (
          <span
            className="ml-1 text-red-400"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {children}

      {helpText && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

function MoneyInput({
  id,
  name,
  value,
  placeholder,
  onChange,
  required = true,
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        $
      </span>

      <input
        id={id}
        className={`${inputClass} pl-8`}
        name={name}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

function CommissionDisplay({
  contracts,
  commission,
}) {
  const contractLabel =
    contracts === 1 ? "contract" : "contracts";

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-300">
            Automatic Commission
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            ${COMMISSION_PER_CONTRACT.toFixed(2)} per
            contract for both opening and closing.
          </p>
        </div>

        <span className="shrink-0 whitespace-nowrap text-lg font-bold text-blue-400 tabular-nums">
          {formatMoney(commission)}
        </span>
      </div>

      <div className="mt-3 border-t border-blue-500/10 pt-3">
        <p className="text-xs text-slate-500">
          Based on{" "}
          <span className="font-semibold text-slate-300">
            {contracts} {contractLabel}
          </span>{" "}
          across two sides of the trade.
        </p>
      </div>
    </div>
  );
}

function formatMoney(amount) {
  const number = Number(amount);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(
    Number.isFinite(number) ? number : 0
  );
}