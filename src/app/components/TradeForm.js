"use client";

import { useEffect } from "react";
import {
  calculateCommission,
  COMMISSION_PER_CONTRACT,
} from "@/app/lib/calculations";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export default function TradeForm({
  form,
  setForm,
  saveTrade,
  closeModal,
  isEditing,
  submitting,
}) {
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") {
        closeModal();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeModal]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }

  const automaticCommission = calculateCommission({
    contracts: form.contracts,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              {isEditing ? "Update Journal Entry" : "New Journal Entry"}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              {isEditing ? "Edit Trade" : "Add Trade"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={saveTrade}
          className="grid gap-5 p-6 md:grid-cols-2"
        >
          <FormField label="Ticker">
            <input
              className={inputClass}
              name="ticker"
              placeholder="QQQ"
              value={form.ticker ?? ""}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Trade Date">
            <input
              className={inputClass}
              name="date"
              type="date"
              value={form.date ?? ""}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Option Type">
            <select
              className={inputClass}
              name="direction"
              value={form.direction ?? "CALL"}
              onChange={handleChange}
            >
              <option value="CALL">Call</option>
              <option value="PUT">Put</option>
            </select>
          </FormField>

          <FormField label="Contracts">
            <input
              className={inputClass}
              name="contracts"
              type="number"
              min="1"
              step="1"
              value={form.contracts ?? "1"}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Entry Price">
            <input
              className={inputClass}
              name="entryPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="2.95"
              value={form.entryPrice ?? ""}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Exit Price">
            <input
              className={inputClass}
              name="exitPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="3.30"
              value={form.exitPrice ?? ""}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Automatic Commission">
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  ${COMMISSION_PER_CONTRACT.toFixed(2)} per contract,
                  each side
                </span>

                <span className="font-bold text-blue-400">
                  ${automaticCommission.toFixed(2)}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Based on {Number(form.contracts || 0)}{" "}
                {Number(form.contracts) === 1
                  ? "contract"
                  : "contracts"}{" "}
                for opening and closing the trade.
              </p>
            </div>
          </FormField>

          <FormField label="Other Fees">
            <input
              className={inputClass}
              name="fees"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.03"
              value={form.fees ?? ""}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Trade Setup">
            <select
              className={inputClass}
              name="setup"
              value={form.setup ?? "Opening Range Breakout"}
              onChange={handleChange}
            >
              <option value="Opening Range Breakout">
                Opening Range Breakout
              </option>
              <option value="Support Bounce">Support Bounce</option>
              <option value="Resistance Rejection">
                Resistance Rejection
              </option>
              <option value="EMA Bounce">EMA Bounce</option>
              <option value="Reversal">Reversal</option>
              <option value="Other">Other</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Trade Notes
            </label>

            <textarea
              id="notes"
              className={`${inputClass} min-h-36 resize-y`}
              name="notes"
              placeholder="Why you entered, why you exited, mistakes, emotions, and lessons learned..."
              value={form.notes ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-5 md:col-span-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                  ? "Update Trade"
                  : "Save Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      {children}
    </div>
  );
}