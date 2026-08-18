"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_PACK_SIZE = "545";
const DEFAULT_DAYS_IN_MONTH = 30;
const MONTH_LENGTHS = [30, 31] as const;

type MonthLength = (typeof MONTH_LENGTHS)[number];

function useCountUp(target: number | null, duration = 700) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (target === null) {
      fromRef.current = 0;
      setValue(0);
      return;
    }

    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + delta * eased;
      setValue(next);
      fromRef.current = next;
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function ProgressRing({ progress }: { progress: number }) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
      <defs>
        <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        className="text-slate-700/60"
      />
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

export default function UsageAlchemist() {
  const [dayNumber, setDayNumber] = useState<number | null>(null);
  const [daysInMonth, setDaysInMonth] = useState<MonthLength>(
    DEFAULT_DAYS_IN_MONTH
  );
  const [packSizeInput, setPackSizeInput] = useState<string>(DEFAULT_PACK_SIZE);

  // Keep the selected day valid when switching from a 31- to a 30-day month.
  useEffect(() => {
    setDayNumber((day) => (day && day > daysInMonth ? daysInMonth : day));
  }, [daysInMonth]);

  const packSize = useMemo(() => {
    const parsed = parseFloat(packSizeInput);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [packSizeInput]);

  const perDay = packSize !== null ? packSize / daysInMonth : null;
  const allowance =
    perDay !== null && dayNumber !== null ? perDay * dayNumber : null;
  const remaining =
    packSize !== null && allowance !== null ? packSize - allowance : null;
  const daysLeft = dayNumber !== null ? daysInMonth - dayNumber : null;
  const progress = dayNumber !== null ? dayNumber / daysInMonth : 0;

  const animatedAllowance = useCountUp(allowance);

  const handleReset = () => {
    setDayNumber(null);
    setDaysInMonth(DEFAULT_DAYS_IN_MONTH);
    setPackSizeInput(DEFAULT_PACK_SIZE);
  };

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_15%_-10%,rgba(56,189,248,0.16),transparent),radial-gradient(50rem_35rem_at_95%_110%,rgba(129,140,248,0.16),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:44px_44px]"
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10">
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Data budget
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Usage Alchemist
          </h1>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Turn your monthly pack into a day-by-day allowance.
          </p>
        </header>

        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* ── Inputs ───────────────────────────────────────────── */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-sky-500/5 backdrop-blur-sm sm:p-7">
            <div className="space-y-7">
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <label
                    htmlFor="packSize"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Pack size
                  </label>
                  <span className="text-xs text-slate-500">
                    default {DEFAULT_PACK_SIZE} GB
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="packSize"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={packSizeInput}
                    onChange={(e) => setPackSizeInput(e.target.value)}
                    placeholder={DEFAULT_PACK_SIZE}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-3 pr-14 pl-4 text-lg font-semibold text-slate-100 tabular-nums placeholder-slate-600 transition focus:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-500">
                    GB
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-200">
                  Days in month
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-1.5">
                  {MONTH_LENGTHS.map((length) => {
                    const active = daysInMonth === length;
                    return (
                      <button
                        key={length}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setDaysInMonth(length)}
                        className={`rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${
                          active
                            ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/25"
                            : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                        }`}
                      >
                        {length} days
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <label className="text-sm font-semibold text-slate-200">
                    Day of the month
                  </label>
                  {dayNumber !== null && (
                    <button
                      type="button"
                      onClick={() => setDayNumber(null)}
                      className="text-xs text-slate-500 transition hover:text-slate-300"
                    >
                      clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-7 gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                  {days.map((day) => {
                    const active = dayNumber === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setDayNumber(day)}
                        className={`aspect-square rounded-lg text-sm font-medium tabular-nums transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${
                          active
                            ? "scale-105 bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/25"
                            : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── Result ───────────────────────────────────────────── */}
          <section className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-indigo-500/5 backdrop-blur-sm sm:p-7">
            <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
              Your allowance
            </h2>

            <div className="relative mx-auto my-6 grid h-52 w-52 place-items-center">
              <ProgressRing progress={progress} />
              <div className="absolute inset-0 grid place-items-center text-center">
                {allowance !== null ? (
                  <div>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-5xl font-bold tabular-nums text-transparent">
                        {animatedAllowance.toFixed(1)}
                      </span>
                      <span className="text-xl font-medium text-slate-400">
                        GB
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      by day {dayNumber} of {daysInMonth}
                    </p>
                  </div>
                ) : (
                  <p className="max-w-[9rem] text-sm leading-relaxed text-slate-500">
                    Pick a day to see your allowance
                  </p>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                {
                  label: "Per day",
                  value: perDay !== null ? perDay.toFixed(2) : "—",
                },
                {
                  label: "Remaining",
                  value: remaining !== null ? remaining.toFixed(1) : "—",
                },
                {
                  label: "Days left",
                  value: daysLeft !== null ? String(daysLeft) : "—",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 px-2 py-3"
                >
                  <dt className="text-[0.65rem] tracking-wide text-slate-500 uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-100">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={handleReset}
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-800/60 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
            >
              Reset
            </button>
          </section>
        </div>

        <footer className="text-sm text-slate-600">Designed by Groupify.</footer>
      </main>
    </div>
  );
}
