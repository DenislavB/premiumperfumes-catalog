"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid username or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0B08] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[#C9A84C] tracking-widest text-xl uppercase font-medium mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
            Premium Perfumes
          </p>
          <p className="text-[#F5ECD7]/30 text-xs tracking-widest uppercase">Admin Panel</p>
        </div>
        <form onSubmit={submit} className="bg-[#161410] border border-[#2A2418] p-8 flex flex-col gap-5">
          <div>
            <label className="text-xs text-[#F5ECD7]/50 tracking-widest uppercase block mb-2">Username</label>
            <input
              required
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-none"
            />
          </div>
          <div>
            <label className="text-xs text-[#F5ECD7]/50 tracking-widest uppercase block mb-2">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-none"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
