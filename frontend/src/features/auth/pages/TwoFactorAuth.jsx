import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@hooks/useAuth";

function TwoFactorAuth() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter a valid 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(isAuthenticated ? "/" : "/login", { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/20">
            <ShieldCheck className="h-6 w-6 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-semibold">Two-Factor Authentication</h1>
          <p className="mt-2 text-sm text-slate-300">
            Enter the 6-digit security code from your authenticator app.
          </p>

          {error ? (
            <div className="mt-4 rounded-lg border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-100">
              {error}
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="000000"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-cyan-400 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="mt-5 text-sm">
            <Link to="/login" className="text-cyan-300 hover:text-cyan-200">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorAuth;
