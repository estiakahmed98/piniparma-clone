"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collectionImage } from "@/lib/products";
import { Icon } from "./Icons";

type AccountMode = "login" | "signup" | "reset";

export function AccountDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<AccountMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  function changeMode(next: AccountMode) {
    setMode(next);
    setShowPassword(false);
    setMessage("");
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "login") {
      onClose();
      router.push("/admin");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    setMessage("");
    setError("");
    if (mode === "signup" && !String(data.get("name") || "").trim()) {
      setError("Please enter your name.");
      return;
    }
    if (
      mode === "signup" &&
      data.get("password") !== data.get("confirmPassword")
    ) {
      setError("Your passwords do not match. Please try again.");
      return;
    }
    setMessage(
      mode === "reset"
        ? "Password reset preview complete. No email was sent; account services are not connected yet."
        : mode === "signup"
          ? "Sign-up preview complete. No account was created or details saved; account services are not connected yet."
          : "Login preview complete. No sign-in was performed or details saved; account services are not connected yet.",
    );
    form.reset();
    setShowPassword(false);
  }

  return (
    <dialog
      className="auth-dialog"
      ref={dialogRef}
      aria-labelledby="account-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="auth-layout">
        <aside className="auth-editorial">
          <img src={collectionImage("suits")} alt="" />
          <div className="auth-editorial-top">
            Aura BOED<span>THE ART OF DRESSING WELL</span>
          </div>
          <div className="auth-editorial-copy">
            <span className="eyebrow">YOUR STYLE, YOUR WORLD</span>
            <h2>
              A little more
              <br />
              <em>distinctly you.</em>
            </h2>
            <p>
              Considered pieces. Lasting impressions.
              <br />
              Discover your next everyday favourite.
            </p>
          </div>
        </aside>
        <section className="auth-content">
          <button
            type="button"
            className="auth-close"
            onClick={onClose}
            aria-label="Close account dialog"
          >
            <Icon name="close" size={22} />
          </button>
          <span className="eyebrow">THE AURA BOED ACCOUNT</span>
          <h2 id="account-title">
            {mode === "signup"
              ? "Make yourself at home."
              : mode === "reset"
                ? "A fresh start."
                : "Welcome back."}
          </h2>
          <p className="auth-intro">
            {mode === "signup"
              ? "Create your account and make Aura BOED your own."
              : mode === "reset"
                ? "Enter your email to reset your password."
                : "Your next favourite piece is waiting. Come on in."}
          </p>
          {mode !== "reset" && (
            <div
              className="auth-switch"
              role="group"
              aria-label="Account options"
            >
              <button
                type="button"
                aria-pressed={mode === "login"}
                onClick={() => changeMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                aria-pressed={mode === "signup"}
                onClick={() => changeMode("signup")}
              >
                Sign up
              </button>
            </div>
          )}
          <form
            className="auth-form"
            key={mode}
            noValidate={mode === "login"}
            onSubmit={submit}
            onChange={() => {
              setError("");
              setMessage("");
            }}
          >
            {mode === "signup" && (
              <label htmlFor="account-name">
                Full name
                <input
                  id="account-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                  maxLength={100}
                />
              </label>
            )}
            <label htmlFor="account-email">
              Email address
              <input
                id="account-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={254}
              />
            </label>
            {mode !== "reset" && (
              <label htmlFor="account-password">
                <span id="account-password-label">Password</span>
                <span className="auth-password">
                  <input
                    id="account-password"
                    aria-labelledby="account-password-label"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    placeholder={
                      mode === "signup"
                        ? "At least 8 characters"
                        : "Enter your password"
                    }
                    minLength={mode === "signup" ? 8 : undefined}
                    required
                  />
                  <button
                    type="button"
                    aria-controls="account-password"
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((shown) => !shown)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </span>
              </label>
            )}
            {mode === "signup" && (
              <label htmlFor="account-confirm-password">
                Confirm password
                <input
                  id="account-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                />
              </label>
            )}
            {mode === "login" && (
              <button
                className="auth-forgot"
                type="button"
                onClick={() => changeMode("reset")}
              >
                Forgot password?
              </button>
            )}
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="auth-status" role="status">
                {message}
              </p>
            )}
            <button className="dark-button auth-submit" type="submit">
              {mode === "signup"
                ? "CREATE ACCOUNT"
                : mode === "reset"
                  ? "SEND RESET LINK"
                  : "LOG IN"}
              <Icon name="arrow-right" size={18} />
            </button>
          </form>
          <Link className="admin-entry" href="/admin" onClick={onClose}>
            Demo admin login <Icon name="arrow-right" size={16} />
          </Link>
          <p className="auth-other">
            {mode === "signup"
              ? "Already part of Aura BOED?"
              : mode === "reset"
                ? "Remember your password?"
                : "New to Aura BOED?"}{" "}
            <button
              type="button"
              onClick={() => changeMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
          <p className="auth-demo">
            <Icon name="shield" size={15} />
            <span>
              Design preview · Details stay in this form and are never saved or
              sent. Account services coming soon.
            </span>
          </p>
        </section>
      </div>
    </dialog>
  );
}
