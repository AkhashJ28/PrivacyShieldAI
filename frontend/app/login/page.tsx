"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push("/dashboard");
      return;
    }

    setError(result.error || "Authentication failed");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 login-scanlines opacity-[0.03]" />
        <div className="absolute inset-0 login-grid opacity-[0.04]" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mx-auto login-shield-pulse">
            <Shield className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">PrivacyShield AI</h1>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em]">
            Secure Authentication Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-light/40 to-transparent" />

          {error && (
            <div className="flex items-center gap-2.5 p-3 bg-danger/5 border border-danger/20 rounded-lg animate-shake">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <p className="text-xs text-danger font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="login-email" className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Operator Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@agency.gov"
              className="w-full bg-background/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary-light/50 focus:ring-1 focus:ring-primary-light/20 transition-all login-input-glow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full bg-background/80 border border-white/10 rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary-light/50 focus:ring-1 focus:ring-primary-light/20 transition-all login-input-glow"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-3.5 rounded-lg transition-all neon-glow-purple disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access System</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600 font-mono">
          All access attempts are monitored and logged.
        </p>
      </div>
    </div>
  );
}
