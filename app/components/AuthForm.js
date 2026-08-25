import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);
    setMessage("");
    const result = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            // Works for localhost in development and the current Vercel URL in production.
            emailRedirectTo: window.location.origin,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (isSignUp && !result.data.session) {
      setMessage("Account created. Check your email to confirm your account, then sign in.");
    }

    setIsSubmitting(false);
  }

  async function signInWithGoogle() {
    if (!supabase) return;

    setIsGoogleLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Supabase sends the user back here after Google authentication.
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsGoogleLoading(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <h2 id="auth-title">{isSignUp ? "Create an account" : "Sign in"}</h2>
      <p>Sign in to see only your own tasks.</p>
      <button
        className="google-button"
        disabled={isGoogleLoading}
        onClick={signInWithGoogle}
        type="button"
      >
        {isGoogleLoading ? "Opening Google..." : "Continue with Google"}
      </button>
      <div className="auth-divider" aria-hidden="true">or</div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="6" required />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>
      {message && <p className="error-message" role="alert">{message}</p>}
      <button className="text-button" onClick={() => setIsSignUp(!isSignUp)} type="button">
        {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </section>
  );
}
