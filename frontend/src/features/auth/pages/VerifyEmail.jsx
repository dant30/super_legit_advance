import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, MailCheck, RefreshCcw, XCircle } from "lucide-react";
import { authAPI } from "../services/auth";
import { AUTH_EMAIL_REGEX } from "../types";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendState, setResendState] = useState("idle");

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      if (!uid || !token) {
        setStatus("error");
        setMessage("Verification link is incomplete.");
        return;
      }

      setStatus("loading");
      try {
        await authAPI.verifyEmail(uid, token);
        if (!mounted) return;
        setStatus("success");
        setMessage("Email verified successfully. You can now sign in.");
      } catch (err) {
        if (!mounted) return;
        setStatus("error");
        setMessage(err?.message || "Email verification failed.");
      }
    };

    verify();
    return () => {
      mounted = false;
    };
  }, [uid, token]);

  const resend = async (event) => {
    event.preventDefault();
    if (!AUTH_EMAIL_REGEX.test(email.trim())) {
      setResendState("error");
      return;
    }
    setResendState("loading");
    try {
      await authAPI.resendVerificationEmail(email.trim().toLowerCase());
      setResendState("success");
    } catch {
      setResendState("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <h1 className="text-2xl font-semibold">Verify Email</h1>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            {status === "loading" ? (
              <p className="text-sm text-slate-300">Verifying your email link...</p>
            ) : null}
            {status === "success" ? (
              <div className="flex items-start gap-3 text-success-100">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <p className="text-sm">{message}</p>
              </div>
            ) : null}
            {status === "error" ? (
              <div className="flex items-start gap-3 text-danger-100">
                <XCircle className="mt-0.5 h-5 w-5" />
                <p className="text-sm">{message}</p>
              </div>
            ) : null}
          </div>

          <form onSubmit={resend} className="mt-6 space-y-3">
            <label className="text-sm font-medium text-slate-200" htmlFor="verify-email">
              Need a new verification email?
            </label>
            <div className="flex gap-2">
              <input
                id="verify-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@superlegitadvance.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
              >
                <RefreshCcw className="h-4 w-4" />
                Send
              </button>
            </div>
            {resendState === "success" ? (
              <p className="text-xs text-success-200">Verification email sent.</p>
            ) : null}
            {resendState === "error" ? (
              <p className="text-xs text-danger-200">Unable to send verification email.</p>
            ) : null}
          </form>

          <div className="mt-6 flex gap-3">
            <Link to="/login" className="text-sm text-cyan-300 hover:text-cyan-200">
              Back to Login
            </Link>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-slate-200">
              <MailCheck className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
