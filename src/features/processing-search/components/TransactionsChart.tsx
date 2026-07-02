import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ProcessingTransaction } from '../services/transactions-search-service';

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatNumber(value: number | string) {
  if (value == null || isNaN(Number(value))) return "0";
  return Number(value)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function dayKeyFromTs(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseTxTimestamp(t: ProcessingTransaction) {
  const date = String(t.localTransactionDate || "").slice(0, 10);
  const time = String(t.localTransactionTime || "00:00:00").slice(0, 8);
  if (!date) return null;

  const ts = new Date(`${date}T${time}`).getTime();
  return Number.isFinite(ts) ? ts : null;
}

function pickMostFrequent(items: string[]) {
  const map = new Map<string, number>();
  for (const it of items) {
    const v = String(it || "").trim();
    if (!v) continue;
    map.set(v, (map.get(v) || 0) + 1);
  }
  let best = "";
  let bestCount = 0;
  for (const [k, c] of map.entries()) {
    if (c > bestCount) {
      best = k;
      bestCount = c;
    }
  }
  return best || "—";
}

function normalizeAmount(raw: number | string) {
  const v = Number(raw);
  if (!Number.isFinite(v)) return 0;
  const normalized = v >= 1000 && v % 100 === 0 ? v / 100 : v;
  return Math.round(normalized);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-slate-100 text-sm">
        <div className="font-semibold mb-2 text-slate-800">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-600">{p.name}:</span>
            <span className="font-medium">{formatNumber(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface TransactionsChartProps {
  transactions: ProcessingTransaction[];
}

export function TransactionsChart({ transactions }: TransactionsChartProps) {
  const [metric, setMetric] = useState<"count" | "sum">("count");

  const {
    chartData,
    totalCount,
    totalSum,
    avgAmount,
    avgOpsPerDay,
    avgSumPerDay,
    atmAddress,
  } = useMemo(() => {
    const filtered = transactions.filter((t) => {
      const amount = Number(t.nationalAmount ?? t.amount);
      const reversal = Number(t.reversal);
      return Number.isFinite(amount) && amount > 0 && reversal !== 1;
    });

    const atmAddress = pickMostFrequent(filtered.map((t) => t.terminalAddress));

    const rows = [];
    for (const t of filtered) {
      const ts = parseTxTimestamp(t);
      if (!ts) continue;

      const amountSource = t.nationalAmount ?? t.amount;

      rows.push({
        ts,
        amount: normalizeAmount(amountSource),
        dayKey: dayKeyFromTs(ts),
      });
    }

    const grouped = rows.reduce((acc: any, curr) => {
      if (!acc[curr.dayKey]) {
        acc[curr.dayKey] = { date: curr.dayKey, count: 0, sum: 0 };
      }
      acc[curr.dayKey].count += 1;
      acc[curr.dayKey].sum += curr.amount;
      return acc;
    }, {});

    const chartData = Object.values(grouped)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d: any) => ({
        date: d.date,
        operations: d.count,
        amount: d.sum,
      }));

    const totalCount = rows.length;
    const totalSum = rows.reduce((s, r) => s + r.amount, 0);
    const avgAmount = totalCount ? Math.round(totalSum / totalCount) : 0;

    const daysCount = chartData.length;
    const avgOpsPerDayRaw = daysCount ? totalCount / daysCount : 0;
    const avgOpsPerDay = Math.floor(avgOpsPerDayRaw + 0.5);

    const avgSumPerDay = daysCount ? Math.round(totalSum / daysCount) : 0;

    return {
      chartData,
      totalCount,
      totalSum,
      avgAmount,
      avgOpsPerDay,
      avgSumPerDay,
      atmAddress,
    };
  }, [transactions]);

  if (!transactions.length) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Динамика транзакций</h3>
          {atmAddress !== "—" && (
            <p className="text-sm text-slate-500 mt-1">Адрес: {atmAddress}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 md:justify-end text-sm">
          <div className="bg-white border border-slate-200 rounded px-3 py-1.5 shadow-sm">
            <span className="text-slate-500">Операций: </span>
            <span className="font-semibold text-slate-800">{formatNumber(totalCount)}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded px-3 py-1.5 shadow-sm">
            <span className="text-slate-500">Сумма: </span>
            <span className="font-semibold text-slate-800">{formatNumber(totalSum)}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded px-3 py-1.5 shadow-sm">
            <span className="text-slate-500">Ср. чек: </span>
            <span className="font-semibold text-slate-800">{formatNumber(avgAmount)}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded px-3 py-1.5 shadow-sm">
            <span className="text-slate-500">Опер./день: </span>
            <span className="font-semibold text-slate-800">{formatNumber(avgOpsPerDay)}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-end mb-6">
          <div className="inline-flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMetric("count")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                metric === "count" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Количество
            </button>
            <button
              onClick={() => setMetric("sum")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                metric === "sum" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Сумма
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dx={-10}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={metric === "count" ? "operations" : "amount"} 
                name={metric === "count" ? "Количество" : "Сумма"}
                stroke="#4f46e5" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMetric)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
