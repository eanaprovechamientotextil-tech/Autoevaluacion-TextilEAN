"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type MetricChartItem = {
  name: string;
  a: number;
  b: number;
  higherBetter: boolean;
};

type EstrategiaBarItem = {
  estrategia: string;
  A: number;
  B: number;
};

type CompareChartsProps = {
  metricData: MetricChartItem[];
  estrategiaData: EstrategiaBarItem[];
  labelA: string;
  labelB: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(value);
}

function DeltaChip({ a, b, higherBetter }: { a: number; b: number; higherBetter: boolean }) {
  const delta = b - a;
  const improved = higherBetter ? delta > 0 : delta < 0;
  const neutral = delta === 0;

  const tone = neutral
    ? "bg-slate-100 text-slate-600"
    : improved
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";

  const prefix = delta > 0 ? "+" : "";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-base font-bold ${tone}`}>
      {prefix}{formatNumber(delta)}
    </span>
  );
}

export function CompareCharts({ metricData, estrategiaData, labelA, labelB }: CompareChartsProps) {
  return (
    <div className="space-y-8">
      {/* KPI Cards comparativos */}
      <section>
        <h3 className="mb-4 text-lg font-bold text-slate-900">KPIs Comparados</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {metricData.map((item) => (
            <div key={item.name} className="rounded-xl border border-[var(--outline)]/30 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.name}</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <p className="text-base text-slate-500">{labelA}</p>
                  <p className="text-lg font-bold text-[var(--primary)]">{formatNumber(item.a)}{item.name.includes("%") ? "%" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-base text-slate-500">{labelB}</p>
                  <p className="text-lg font-bold text-[var(--primary)]">{formatNumber(item.b)}{item.name.includes("%") ? "%" : ""}</p>
                </div>
              </div>
              <div className="mt-2 flex justify-center">
                <DeltaChip a={item.a} b={item.b} higherBetter={item.higherBetter} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gráfica de barras agrupadas - Comentado temporalmente
      <section className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Comparación de Métricas</h3>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend />
              <Bar dataKey="a" name={labelA} fill="#005e9a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="b" name={labelB} fill="#7ac943" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      */}

      {estrategiaData.length > 0 && (
        <section className="rounded-2xl border border-[var(--outline)]/30 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Residuos por Estrategia</h3>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estrategiaData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis
                  type="category"
                  dataKey="estrategia"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                  formatter={(value) => [`${formatNumber(Number(value ?? 0))} kg/mes`, ""]}
                />
                <Legend />
                <Bar dataKey="A" name={labelA} fill="#005e9a" radius={[0, 4, 4, 0]} />
                <Bar dataKey="B" name={labelB} fill="#7ac943" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
