"use client";

import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/app/lib/firebase";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      if (isSignup) {
        const credential =
          await createUserWithEmailAndPassword(
            auth,
            form.email.trim(),
            form.password
          );

        await updateProfile(credential.user, {
          displayName: form.name.trim(),
        });

        // Force the local user object to refresh after
        // setting the display name.
        await credential.user.reload();
      } else {
        await signInWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password
        );
      }
    } catch (firebaseError) {
      setError(getFriendlyAuthError(firebaseError.code));
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode((currentMode) =>
      currentMode === "login" ? "signup" : "login"
    );

    setError("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          Trading Journal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          {isSignup
            ? "Create your account"
            : "Welcome back"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {isSignup
            ? "Create an account to save your trading journey."
            : "Sign in to view your trades and dashboard."}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          {isSignup && (
            <FormField label="Name">
              <input
                className={inputClass}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Aaron"
                value={form.name}
                onChange={handleChange}
                required
              />
            </FormField>
          )}

          <FormField label="Email">
            <input
              className={inputClass}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Password">
            <input
              className={inputClass}
              name="password"
              type="password"
              autoComplete={
                isSignup
                  ? "new-password"
                  : "current-password"
              }
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </FormField>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="mt-5 w-full text-center text-sm text-slate-400 transition hover:text-blue-400"
        >
          {isSignup
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </button>
      </section>
    </main>
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

function getFriendlyAuthError(code) {
  const messages = {
    "auth/email-already-in-use":
      "An account already exists with this email.",
    "auth/invalid-email":
      "Enter a valid email address.",
    "auth/invalid-credential":
      "The email or password is incorrect.",
    "auth/missing-password":
      "Enter your password.",
    "auth/weak-password":
      "Your password must contain at least six characters.",
    "auth/too-many-requests":
      "Too many attempts. Try again later.",
  };

  return messages[code] || "Unable to complete the request.";
}