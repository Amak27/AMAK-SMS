import React, { useState } from "react";
import { School, Key, UserCheck, ShieldAlert, Loader2, Award } from "lucide-react";
import { SystemUser } from "../types";

interface LoginPageProps {
  onLogin: (user: SystemUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Teacher">("Admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const user = await res.json();
        onLogin(user);
      } else {
        const errData = await res.json();
        setError(errData.error || "Authentication failed.");
      }
    } catch (err) {
      setError("Network or server connection failed. Please check your setup.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentialsValue = (userType: "admin" | "teacher") => {
    if (userType === "admin") {
      setUsername("admin");
      setPassword("admin123");
      setRole("Admin");
    } else {
      setUsername("teacher");
      setPassword("teacher123");
      setRole("Teacher");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic ambient highlights in background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10">
        
        {/* School branding / Crest icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-blue-500/5">
            <School size={36} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">Academix ERP</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-widest">Uganda School Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/50 text-red-200 text-xs rounded-xl flex items-start gap-2.5 animate-pulse">
            <ShieldAlert size={18} className="shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Access Denied</p>
              <p className="text-[11px] text-red-400/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400 mb-1.5">
              Secure Username ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full pl-3 pr-3 py-2.5 text-slate-100 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-slate-900/60 transition-all text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400 mb-1.5">
              Secret Passphrase
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3 pr-3 py-2.5 text-slate-100 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-slate-900/60 transition-all text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-[0.98] transition-all cursor-pointer mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin text-white" size={14} />
                Authenticating Credentials...
              </>
            ) : (
              <>
                <UserCheck size={14} />
                Sign In to Academic Workspace
              </>
            )}
          </button>
        </form>

        {/* Demo profiles auto fill shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-900/80">
          <p className="text-[10px] text-slate-500 font-semibold font-mono uppercase tracking-wider text-center mb-3 text-slate-400/80">
            System Pre-Seeded Profiles (Click to fill)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillCredentialsValue("admin")}
              className="py-2 px-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                < Award size={12} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-200">School Admin</span>
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Full ERP Access</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentialsValue("teacher")}
              className="py-2 px-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <Key size={12} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-slate-200">Class Instructor</span>
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Marks & Comments</span>
            </button>
          </div>
        </div>

        {/* System parameters indicator */}
        <p className="text-[9px] text-slate-600 font-mono text-center mt-6">
          System Secure Tunnel • Uganda Standard Grading
        </p>

      </div>
    </div>
  );
}
