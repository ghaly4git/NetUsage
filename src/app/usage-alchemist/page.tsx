"use client";

import { useEffect, useMemo, useState } from "react";
// removed calendar link

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
  const [packSizeInput, setPackSizeInput] = useState<string>("375");
  const MONTHS = useMemo(
    () => [
      { name: "January", days: 31 },
      { name: "February", days: 28 },
      { name: "March", days: 31 },
      { name: "April", days: 30 },
      { name: "May", days: 31 },
      { name: "June", days: 30 },
      { name: "July", days: 31 },
      { name: "August", days: 31 },
      { name: "September", days: 30 },
      { name: "October", days: 31 },
      { name: "November", days: 30 },
      { name: "December", days: 31 },
    ],
    []
  );
  const [selectedMonth, setSelectedMonth] = useState<string>("January");
  const daysInMonth = useMemo(() => {
    const month = MONTHS.find((m) => m.name === selectedMonth);
    return month ? (month.days as 28 | 30 | 31) : 31;
  }, [MONTHS, selectedMonth]);
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
  const monthOptions: Array<SegmentedOption<string>> = useMemo(
    () => MONTHS.map((m) => ({ value: m.name, label: m.name })),
    [MONTHS]
  );

  useEffect(() => {
    const numericPackSize = parseFloat(packSizeInput);
    if (
      dayNumber &&
      daysInMonth &&
      Number.isFinite(numericPackSize) &&
      numericPackSize > 0
    ) {
      const perDay = numericPackSize / daysInMonth;
      const allowance = dayNumber * perDay;
      setResult(allowance);
    } else {
      setResult(null);
    }
  }, [dayNumber, daysInMonth, packSizeInput]);

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
    setSelectedMonth("January");
    setPackSizeInput("375");
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
                  Month
                </label>
                <SegmentedControl
                  options={monthOptions}
                  selected={selectedMonth}
                  onChange={(val) => setSelectedMonth(val as string)}
                  name="month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pack Size (GB)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={packSizeInput}
                  onChange={(e) => setPackSizeInput(e.target.value)}
                  className="w-full rounded-md bg-slate-700/50 border border-slate-600 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                  placeholder="375"
                />
              </div>
            </div>
          </div>

          {result !== null && (
            <div className="p-8 text-center animate-fadeInUp">
              <h2 className="text-lg font-medium text-slate-400">
                Your Usage Allowance
              </h2>
              <div className="my-4 flex items-baseline justify-center gap-2 tracking-tight">
                <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  {animatedResult.toFixed(1)}
                </span>
                <span className="text-4xl opacity-70 text-slate-200">GB</span>
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
