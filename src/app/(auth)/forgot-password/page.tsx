/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useResendResetOtpMutation,
} from "@/redux/api/authApi";
import { getErrorMessage } from "@/lib/utils";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // RTK Query Mutations
  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifyingOtp }] = useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();
  const [resendResetOtp, { isLoading: isResendingOtp }] = useResendResetOtpMutation();

  // Wizard state
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Timers
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Input refs for 6-digit OTP
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Resend Countdown Timer ─────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // ── Success Redirect Timer ────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "SUCCESS") {
      timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, router]);

  // ── Step 1: Submit Email for OTP ──────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    try {
      const res = await forgotPassword({ email: normalizedEmail }).unwrap();
      setInfoMessage(res.message || `Verification code dispatched to ${normalizedEmail}`);
      setStep("OTP");
      setCountdown(60);
      setCanResend(false);
      // Auto focus first OTP input after render
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to send reset code. Please check your email."));
    }
  };

  // ── Step 2: Handle OTP Digit Inputs & Paste ───────────────
  const handleOtpChange = (index: number, value: string) => {
    if (errorMessage) setErrorMessage(null);

    // Handle single character
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned[cleaned.length - 1] ?? ""; // take latest char
    setOtpDigits(newDigits);

    // Advance focus
    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const otpCode = otpDigits.join("").trim();
    if (otpCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      const res = await verifyResetOtp({
        email: email.trim().toLowerCase(),
        otp: otpCode,
      }).unwrap();

      setInfoMessage(res.message || "Code verified successfully! Set your new password.");
      setStep("NEW_PASSWORD");
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Invalid or expired verification code."));
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResendingOtp) return;
    setErrorMessage(null);
    try {
      const res = await resendResetOtp({ email: email.trim().toLowerCase() }).unwrap();
      setInfoMessage(res.message || "A new 6-digit code has been dispatched to your email.");
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Could not resend code. Please try again."));
    }
  };

  // ── Step 3: Set New Password ──────────────────────────────
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isPasswordValid = hasMinLength && passwordsMatch;

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasMinLength) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const otpCode = otpDigits.join("").trim();
    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        otp: otpCode,
        newPassword,
      }).unwrap();

      setStep("SUCCESS");
      setRedirectCountdown(5);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Password reset failed. Please request a new code."));
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all">
      {/* ── Flow Progress Indicator ───────────────────────────── */}
      {step !== "SUCCESS" && (
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === "EMAIL"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/20"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              1
            </span>
            <span className="text-xs font-medium text-slate-400">Email</span>
          </div>
          <div className="h-[1px] flex-1 mx-3 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === "OTP"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/20"
                  : step === "NEW_PASSWORD"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              2
            </span>
            <span className="text-xs font-medium text-slate-400">OTP</span>
          </div>
          <div className="h-[1px] flex-1 mx-3 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === "NEW_PASSWORD"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/20"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              3
            </span>
            <span className="text-xs font-medium text-slate-400">Reset</span>
          </div>
        </div>
      )}

      {/* ── Alerts ─────────────────────────────────────────────── */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {infoMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-300 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="w-5 h-5 shrink-0" />
          <div className="flex-1">{infoMessage}</div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* STEP 1: EMAIL REQUEST                                     */}
      {/* ═════════════════════════════════════════════════════════ */}
      {step === "EMAIL" && (
        <div>
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Forgot Password?
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your verified email to receive a 6-digit recovery OTP
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin@zevon.com"
                  className="w-full rounded-xl bg-zinc-950/60 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* STEP 2: 6-DIGIT OTP VERIFICATION                         */}
      {/* ═════════════════════════════════════════════════════════ */}
      {step === "OTP" && (
        <div>
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Verify 6-Digit Code
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              We dispatched an authentication code to{" "}
              <span className="font-semibold text-amber-400">{email}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setErrorMessage(null);
              }}
              className="mt-1 text-[11px] text-slate-400 hover:text-white underline transition-colors"
            >
              Change email address
            </button>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            {/* 6 Digit Input Group */}
            <div className="flex justify-between gap-2 sm:gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-zinc-950/80 border border-white/10 text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Countdown & Resend */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {canResend ? (
                  <span className="text-amber-400">Code expired or not received?</span>
                ) : (
                  <span>
                    Resend code in{" "}
                    <span className="font-semibold text-amber-400 tabular-nums">
                      {countdown}s
                    </span>
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || isResendingOtp}
                className="flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${isResendingOtp ? "animate-spin" : ""}`}
                />
                Resend OTP
              </button>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setStep("EMAIL")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to email input
            </button>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* STEP 3: NEW PASSWORD RESET                                */}
      {/* ═════════════════════════════════════════════════════════ */}
      {step === "NEW_PASSWORD" && (
        <div>
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create New Password
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Set a strong, unique password for{" "}
              <span className="font-semibold text-amber-400">{email}</span>
            </p>
          </div>

          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-zinc-950/60 border border-white/10 pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-zinc-950/60 border border-white/10 pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-white/5 space-y-2 text-xs">
              <div className="text-slate-400 font-medium">Security checklist:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-emerald-400" : "bg-slate-600"}`} />
                  At least 6 characters
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordsMatch ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? "bg-emerald-400" : "bg-slate-600"}`} />
                  Passwords match
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasUppercase ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? "bg-emerald-400" : "bg-slate-600"}`} />
                  1 uppercase letter
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasNumber ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? "bg-emerald-400" : "bg-slate-600"}`} />
                  1 number
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isResettingPassword || !isPasswordValid}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Confirm Password Reset</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* STEP 4: SUCCESS CONFIRMATION & REDIRECT                   */}
      {/* ═════════════════════════════════════════════════════════ */}
      {step === "SUCCESS" && (
        <div className="text-center py-4 space-y-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Password Reset Successful!
            </h1>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Your credentials have been securely updated in the database. Active sessions have been revoked for your safety.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Auto-redirecting to Sign In in{" "}
              <span className="font-bold text-amber-400 tabular-nums">
                {redirectCountdown}s
              </span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm border border-white/10 active:scale-[0.99] transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
