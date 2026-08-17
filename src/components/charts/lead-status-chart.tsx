"use client";

import { Bar } from "react-chartjs-2";
import "./register";
import { valueLabelPlugin } from "./register";
import { usePrefersDark } from "./use-prefers-dark";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import type { LeadStatus } from "@prisma/client";

const FLAT_HUE = { light: "#2a78d6", dark: "#3987e5" };

export function LeadStatusChart({
  data,
}: {
  data: { status: LeadStatus; count: number }[];
}) {
  const dark = usePrefersDark();
  const textColor = dark ? "#c3c2b7" : "#52514e";
  const gridColor = dark ? "#2c2c2a" : "#e1e0d9";

  return (
    <Bar
      data={{
        labels: data.map((d) => LEAD_STATUS_LABELS[d.status]),
        datasets: [
          {
            label: "Лиды",
            data: data.map((d) => d.count),
            backgroundColor: dark ? FLAT_HUE.dark : FLAT_HUE.light,
            borderRadius: 4,
            borderSkipped: "bottom",
            maxBarThickness: 40,
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
              label: (ctx) => `${ctx.formattedValue} лид(ов)`,
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
