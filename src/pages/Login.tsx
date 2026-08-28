import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";

type Mode = "signIn" | "signUp";

export function Login() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "signUp") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName.trim() || email.split("@")[0] } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setInfo("Account created — check your email to confirm before signing in.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">🏐 Practice Plans</div>
        <h1>{mode === "signIn" ? "Sign in" : "Create your account"}</h1>
        <p className="page-subtitle">
          {mode === "signIn"
            ? "Sign in to see your saved practice plans."
            : "Set up a coach account to save practice plans."}
        </p>

        {error && <div className="form-error">{error}</div>}
        {info && <div className="form-error auth-info">{info}</div>}

        <form className="form" onSubmit={handleSubmit}>
          {mode === "signUp" && (
            <label className="field">
              <span>Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Coach Smith"
              />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="form-actions auth-form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {mode === "signIn" ? "Sign in" : "Create account"}
            </button>
          </div>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button type="button" className="btn btn-block" onClick={handleGoogle}>
          Continue with Google
        </button>

        <button
          type="button"
          className="btn-text auth-switch"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
