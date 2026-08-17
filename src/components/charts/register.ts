import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type Plugin,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required to match chart.js's declaration
  interface PluginOptionsByType<TType> {
    valueLabel?: { color?: string };
  }
}

/** Draws the bar's value above its cap — the "relief" label required whenever
 * a fill's contrast against the surface is below 3:1 (see dataviz skill). */
export const valueLabelPlugin: Plugin<"bar"> = {
  id: "valueLabel",
  afterDatasetsDraw(chart) {
    const color = chart.options.plugins?.valueLabel?.color ?? "#111827";
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        if (value == null) return;
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = "600 12px system-ui, -apple-system, Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const point = bar.getProps(["x", "y"], true);
        ctx.fillText(String(value), point.x, point.y - 6);
        ctx.restore();
      });
    });
  },
};
