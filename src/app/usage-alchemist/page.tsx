"use client";

import { useEffect, useMemo, useState } from "react";

type SegmentedOption<T extends string | number> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string | number> = {
  options: Array<SegmentedOption<T>>;
  selected: T | null;
  onChange: (value: T) => void;
  name: string;
};

function SegmentedControl<T extends string | number>({
  options,
  selected,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-wrap gap-1 w-full bg-slate-700/50 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-3 text-center text-sm font-medium py-2 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
            selected === option.value
              ? "bg-blue-600 shadow-lg"
              : "text-slate-300 hover:bg-slate-600/50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function UsageAlchemist() {
  const [dayNumber, setDayNumber] = useState<number | null>(null);
  const [daysInMonth, setDaysInMonth] = useState<30 | 31>(31);
  const [result, setResult] = useState<number | null>(null);
  const [animatedResult, setAnimatedResult] = useState(0);

  const dayOptions = useMemo(
    () =>
      Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: String(i + 1),
      })),
    []
  );
  const monthOptions: Array<SegmentedOption<30 | 31>> = [
    { value: 30, label: "30 Days" },
    { value: 31, label: "31 Days" },
  ];

  useEffect(() => {
    if (dayNumber && daysInMonth) {
      const allowance = daysInMonth === 30 ? dayNumber * 12.5 : dayNumber * 12;
      setResult(allowance);
    } else {
      setResult(null);
    }
  }, [dayNumber, daysInMonth]);

  useEffect(() => {
    if (result === null) {
      setAnimatedResult(0);
      return;
    }

    let start = 0;
    const end = result;
    if (start === end) return;

    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedResult(end);
        clearInterval(timer);
      } else {
        setAnimatedResult(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [result]);

  const handleReset = () => {
    setDayNumber(null);
    setDaysInMonth(31);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .animate-fadeOutDown {
          animation: fadeOutDown 0.5s ease-in forwards;
        }
      `}</style>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans antialiased overflow-hidden">
        <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 border border-slate-700 transition-all duration-500 ease-in-out">
          <div
            className={`p-8 transition-opacity duration-500 ${
              result !== null
                ? "opacity-0 h-0 overflow-hidden"
                : "opacity-100 h-auto"
            }`}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Usage Alchemist
              </h1>
              <p className="text-slate-400 mt-2">
                Calculate your daily allowance.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Day of the Month
                </label>
                <SegmentedControl
                  options={dayOptions.slice(0, daysInMonth)}
                  selected={dayNumber}
                  onChange={setDayNumber}
                  name="dayNumber"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Days In The Month
                </label>
                <SegmentedControl
                  options={monthOptions}
                  selected={daysInMonth}
                  onChange={(val) => setDaysInMonth(val as 30 | 31)}
                  name="daysInMonth"
                />
              </div>
            </div>
          </div>

          {result !== null && (
            <div className="p-8 text-center animate-fadeInUp">
              <h2 className="text-lg font-medium text-slate-400">
                Your Usage Allowance
              </h2>
              <div className="my-4 text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">
                {animatedResult.toFixed(1)}
                <span className="text-4xl ml-2 opacity-70">units</span>
              </div>
              <p className="text-slate-400 mb-6">
                Based on Day {dayNumber} in a {daysInMonth}-day month.
              </p>
              <button
                onClick={handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
              >
                Calculate Again
              </button>
            </div>
          )}
        </div>
        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>Designed by Groupify.</p>
        </footer>
      </div>
    </>
  );
}
