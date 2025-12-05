"use client";
import { useCallback } from "react";

type Props = {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (next: { min: number; max: number }) => void;
};

export default function DualRangeSlider({ min, max, step = 1, valueMin, valueMax, onChange }: Props) {
  const clamp = useCallback(
    (val: number, low: number, high: number) => Math.max(low, Math.min(high, val)),
    []
  );

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = clamp(Number(e.target.value), min, valueMax - step);
    onChange({ min: next, max: valueMax });
  };
  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = clamp(Number(e.target.value), valueMin + step, max);
    onChange({ min: valueMin, max: next });
  };

  const percent = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="relative w-full py-2">
      <div className="relative h-1.5 rounded bg-neutral-200 dark:bg-neutral-800">
        <div
          className="absolute h-1.5 rounded bg-brand"
          style={{ left: `${percent(valueMin)}%`, right: `${100 - percent(valueMax)}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={handleMin}
        className="pointer-events-auto absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-300 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-neutral-300"
        aria-label="Minimum price"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={handleMax}
        className="pointer-events-auto absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-300 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-neutral-300"
        aria-label="Maximum price"
      />
    </div>
  );
}

