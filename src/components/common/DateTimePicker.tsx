"use client";

import React, { useRef } from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";

interface DateTimePickerProps {
  label: string;
  value: string; // ISO string format 'YYYY-MM-DDTHH:mm'
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  quickButtons?: { label: string; onClick: () => void }[];
}

export function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  min,
  quickButtons,
}: DateTimePickerProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  // Split value into date ('YYYY-MM-DD') and time ('HH:mm')
  const [datePart = "", timePart = ""] = (value || "").split("T");

  const handleDateChange = (newDate: string) => {
    const time = timePart || "12:00";
    onChange(`${newDate}T${time}`);
  };

  const handleTimeChange = (newTime: string) => {
    const date =
      datePart ||
      new Date().toISOString().slice(0, 10);
    onChange(`${date}T${newTime}`);
  };

  // Format readable display
  const getReadableDisplay = () => {
    if (!value) return "Not selected";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      return d.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return value;
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-amber-400">*</span>}
        </label>
        {value && (
          <span className="text-[11px] font-mono text-amber-400/90 font-medium truncate max-w-[220px]">
            {getReadableDisplay()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Date Selector Input */}
        <div
          onClick={() => {
            try {
              dateInputRef.current?.showPicker?.();
            } catch {}
          }}
          className="relative flex items-center rounded-xl bg-zinc-950 border border-white/10 hover:border-amber-400/40 focus-within:border-amber-400 transition-all cursor-pointer group px-3 py-2"
        >
          <Calendar className="w-4 h-4 text-amber-400/80 group-hover:text-amber-400 mr-2 shrink-0 transition" />
          <div className="flex-1 min-w-0">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
              Select Date
            </span>
            <input
              ref={dateInputRef}
              type="date"
              required={required}
              min={min ? min.split("T")[0] : undefined}
              value={datePart}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-transparent text-xs text-white font-mono font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Time Selector Input */}
        <div
          onClick={() => {
            try {
              timeInputRef.current?.showPicker?.();
            } catch {}
          }}
          className="relative flex items-center rounded-xl bg-zinc-950 border border-white/10 hover:border-amber-400/40 focus-within:border-amber-400 transition-all cursor-pointer group px-3 py-2"
        >
          <Clock className="w-4 h-4 text-amber-400/80 group-hover:text-amber-400 mr-2 shrink-0 transition" />
          <div className="flex-1 min-w-0">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
              Select Time (24h / AM-PM)
            </span>
            <input
              ref={timeInputRef}
              type="time"
              required={required}
              value={timePart}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full bg-transparent text-xs text-white font-mono font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      {quickButtons && quickButtons.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          {quickButtons.map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={btn.onClick}
              className="px-2 py-0.5 rounded-lg bg-zinc-950 hover:bg-amber-500/20 hover:border-amber-500/40 border border-white/10 text-[10px] text-slate-300 hover:text-amber-300 font-mono transition-all cursor-pointer"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
