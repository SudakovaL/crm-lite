"use client";

import { Bar } from "react-chartjs-2";
import "./register";
import { valueLabelPlugin } from "./register";
import { usePrefersDark } from "./use-prefers-dark";

const ORDINAL_STEPS = {
  light: ["#6da7ec", "#3987e5", "#256abf", "#184f95"],
  dark: ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"],
};

export function OpportunityFunnelChart({
  data,
}: {
  data: { stageId: string; stageName: string; order: number; count: number }[];
}) {
  const dark = usePrefersDark();
  const textColor = dark ? "#c3c2b7" : "#52514e";
  const gridColor = dark ? "#2c2c2a" : "#e1e0d9";
  const steps = dark ? ORDINAL_STEPS.dark : ORDINAL_STEPS.light;

  return (
    <Bar
      data={{
        labels: data.map((d) => d.stageName),
        datasets: [
          {
            label: "Открытые сделки",
            data: data.map((d) => d.count),
            backgroundColor: data.map((_, i) => steps[i % steps.length]),
            borderRadius: 4,
            borderSkipped: "bottom",
            maxBarThickness: 56,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.formattedValue} сделок`,
            },
          },
          valueLabel: { color: textColor },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 12 } },
          },
          y: {
            beginAtZero: true,
            ticks: { color: textColor, precision: 0 },
            grid: { color: gridColor },
          },
        },
      }}
      plugins={[valueLabelPlugin]}
    />
  );
}
