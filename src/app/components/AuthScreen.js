"use client";

import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/app/lib/firebase";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-base text-white outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function validateForm() {
    const email = form.email.trim();
    const password = form.password;
    const name = form.name.trim();

    if (isSignup && name.length < 2) {
      return "Enter your name using at least two characters.";
    }

    if (!email) {
      return "Enter your email address.";
    }

    if (!email.includes("@")) {
      return "Enter a valid email address.";
    }

    if (!password) {
      return "Enter your password.";
    }

    if (password.length < 6) {
      return "Your password must contain at least six characters.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const normalizedEmail = form.email
      .trim()
      .toLowerCase();

    setError("");
    setSubmitting(true);

    try {
      if (isSignup) {
        const credential =
          await createUserWithEmailAndPassword(
            auth,
            normalizedEmail,
            form.password
          );

        await updateProfile(credential.user, {
          displayName: form.name.trim(),
        });

        await credential.user.reload();
        await credential.user.getIdToken(true);
      } else {
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          form.password
        );
      }
    } catch (firebaseError) {
      console.error(
        isSignup
          ? "Unable to create account:"
          : "Unable to sign in:",
        firebaseError
      );

      setError(
        getFriendlyAuthError(firebaseError.code)
      );
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode((currentMode) =>
      currentMode === "login"
        ? "signup"
        : "login"
    );

    setForm((currentForm) => ({
      name: "",
      email: currentForm.email,
      password: "",
    }));

    setShowPassword(false);
    setError("");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <BackgroundDecoration />

      <section className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40 lg:grid-cols-[1.05fr_1fr]">
        <AuthIntroduction />

        <div className="p-5 sm:p-8 lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              {isSignup
                ? "Start Your Journal"
                : "Account Access"}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              {isSignup
                ? "Create your account"
                : "Welcome back"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {isSignup
                ? "Create an account to securely save and review your trading journey."
                : "Sign in to review your trades, calendar, and performance."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
            noValidate
          >
            {isSignup && (
              <FormField
                id="name"
                label="Name"
                required
              >
                <input
                  id="name"
                  className={inputClass}
                  name="name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  placeholder="Aaron"
                  value={form.name}
                  onChange={handleChange}
                  disabled={submitting}
                  minLength={2}
                  required
                />
              </FormField>
            )}

            <FormField
              id="email"
              label="Email"
              required
            >
              <input
                id="email"
                className={inputClass}
                name="email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="email"
                autoFocus={!isSignup}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              required
              helpText={
                isSignup
                  ? "Use at least six characters."
                  : undefined
              }
            >
              <div className="relative">
                <input
                  id="password"
                  className={`${inputClass} pr-16`}
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete={
                    isSignup
                      ? "new-password"
                      : "current-password"
                  }
                  placeholder={
                    isSignup
                      ? "Create a password"
                      : "Enter your password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-400 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </FormField>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
              )}

              <span>
                {submitting
                  ? isSignup
                    ? "Creating Account..."
                    : "Signing In..."
                  : isSignup
                    ? "Create Account"
                    : "Sign In"}
              </span>
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5 text-center">
            <p className="text-sm text-slate-500">
              {isSignup
                ? "Already have an account?"
                : "New to the trading journal?"}
            </p>

            <button
              type="button"
              onClick={switchMode}
              disabled={submitting}
              className="mt-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSignup
                ? "Sign in instead"
                : "Create an account"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthIntroduction() {
  return (
    <div className="relative hidden overflow-hidden border-r border-slate-800 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
          Trading Journal
        </p>

        <h2 className="mt-5 text-4xl font-bold leading-tight text-white">
          Turn every trade into a lesson.
        </h2>

        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
          Track your results, review your decisions, and
          identify the habits affecting your performance.
        </p>
      </div>

      <div className="relative mt-12 space-y-4">
        <FeatureItem text="Review daily and monthly performance" />
        <FeatureItem text="Track wins, losses, and trading costs" />
        <FeatureItem text="Keep every trade securely saved" />
      </div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-300">
        ✓
      </span>

      <span>{text}</span>
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
    <div>
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

function BackgroundDecoration() {
  return (
    <>
      <div className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />
    </>
  );
}

function getFriendlyAuthError(code) {
  const messages = {
    "auth/email-already-in-use":
      "An account already exists with this email address.",

    "auth/invalid-email":
      "Enter a valid email address.",

    "auth/invalid-credential":
      "The email or password is incorrect.",

    "auth/user-not-found":
      "No account was found with this email address.",

    "auth/wrong-password":
      "The email or password is incorrect.",

    "auth/missing-password":
      "Enter your password.",

    "auth/weak-password":
      "Your password must contain at least six characters.",

    "auth/too-many-requests":
      "Too many unsuccessful attempts. Please try again later.",

    "auth/network-request-failed":
      "A network error occurred. Check your internet connection.",

    "auth/operation-not-allowed":
      "Email and password sign-in is not currently enabled.",
  };

  return (
    messages[code] ||
    "Unable to complete the request. Please try again."
  );
}