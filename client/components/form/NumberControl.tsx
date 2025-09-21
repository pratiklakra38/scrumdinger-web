import React from "react";

interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
}

export default function NumberControl({
  value,
  min = 0,
  max = 9999,
  step = 1,
  onChange,
  label,
}: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      {label && <div className="text-sm w-28">{label}</div>}
      <div className="inline-flex items-center rounded-md border bg-background">
        <button
          type="button"
          aria-label="decrease"
          className="px-3 py-2 text-sm"
          onClick={() => onChange(Math.max(min, value - step))}
        >
          −
        </button>
        <div className="px-4 text-sm tabular-nums">{value}</div>
        <button
          type="button"
          aria-label="increase"
          className="px-3 py-2 text-sm"
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </button>
      </div>
    </div>
  );
}
