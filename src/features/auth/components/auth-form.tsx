"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (mode === "register" && fullName.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const supabase = createSupabaseBrowserClient();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setError("Account created. Check your email to confirm your address, then sign in.");
          return;
        }
      } else {
        const supabase = createSupabaseBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" href="/">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          taskflow
        </Link>
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">
          {mode === "login" ? "Sign in to keep your projects moving." : "Start planning with a secure shared workspace."}
        </p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>
          )}
          <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" disabled={loading} type="submit">
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="auth-switch">
          {mode === "login" ? "New to taskflow? " : "Already have an account? "}
          <Link href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</Link>
        </p>
      </section>
    </main>
  );
}
