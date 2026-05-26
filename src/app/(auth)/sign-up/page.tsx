"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign in failed. Try signing in.");
      } else {
        router.push("/boards");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-panel rounded-2xl p-8 md:p-10">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)] group-hover:scale-[1.05] transition-transform">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
            >
              token
            </span>
          </span>
          <span className="font-display font-semibold text-[18px] tracking-tight text-[var(--color-on-surface)]">
            Nexus <span className="text-[var(--color-primary)]">Studio</span>
          </span>
        </Link>

        <h1 className="font-display font-semibold text-[28px] text-[var(--color-on-surface)] text-center mb-2 tracking-[-0.02em]">
          Create your workspace
        </h1>
        <p className="text-[14px] text-[var(--color-on-surface-variant)] text-center mb-8">
          Free forever for personal use. No credit card.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-[13px] rounded-lg px-4 py-3 mb-6 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="name"
            label="Full name"
            type="text"
            placeholder="Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            Create account
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Button>
        </form>

        <p className="text-center text-[13px] text-[var(--color-on-surface-variant)] mt-7">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-[var(--color-primary)] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
