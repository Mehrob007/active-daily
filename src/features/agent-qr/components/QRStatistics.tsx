import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { qrAgentService } from '../services/qr-agent-service';
import { toast } from '@/hooks/use-toast';

interface QRStatisticsProps {
  startDate: string;
  endDate: string;
}

function formatNumber(value: any) {
  if (value == null || isNaN(value)) return '0';
  return Number(value)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    .replace('.', ',');
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/85 p-3 rounded-xl shadow-lg backdrop-blur-md text-sm border border-slate-200">
        <div className="font-semibold mb-1.5">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ backgroundColor: p.color }}></span>
            <span className="text-muted-foreground">{p.name}: </span>
            <span className="font-medium">{formatNumber(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const QRStatistics: React.FC<QRStatisticsProps> = ({ startDate, endDate }) => {
  const [metric, setMetric] = useState<'count' | 'sum'>('count');
  const [usData, setUsData] = useState<any[]>([]);
  const [themData, setThemData] = useState<any[]>([]);
  const [mergedData, setMergedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (type: 'usOnThem' | 'themOnUs') => {
    try {
      setLoading(true);
      const result = await qrAgentService.getTransactions(type, startDate, endDate);
      
      const mapped = result.map((item: any) => {
        const date = item.created_at?.split('T')[0] || item.creation_datetime?.split('T')[0];
        return {
          date,
          count: 1,
          sum: Number(item.amount) || 0,
        };
      });

      const grouped = mapped.reduce((acc: any, curr: any) => {
        if (!acc[curr.date]) acc[curr.date] = { date: curr.date, count: 0, sum: 0 };
        acc[curr.date].count += curr.count;
        acc[curr.date].sum += curr.sum;
        return acc;
      }, {});

      const finalResult = Object.values(grouped).sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      if (type === 'usOnThem') setUsData(finalResult);
      else setThemData(finalResult);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData('usOnThem');
      fetchData('themOnUs');
    }
  }, [startDate, endDate, fetchData]);

  useEffect(() => {
    const allDates = Array.from(
      new Set([...usData.map((d) => d.date), ...themData.map((d) => d.date)])
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const merged = allDates.map((d) => {
      const us = usData.find((x) => x.date === d);
      const them = themData.find((x) => x.date === d);
      return {
        date: d,
        usOnThem: us ? us[metric] : 0,
        themOnUs: them ? them[metric] : 0,
      };
    });

    setMergedData(merged);
  }, [usData, themData, metric]);

  return (
    <div className="space-y-4 border rounded-xl p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Статистика QR операций</h3>
        <Select value={metric} onValueChange={(val: any) => setMetric(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Выберите метрику" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="count">Количество</SelectItem>
            <SelectItem value="sum">Сумма</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[340px] w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-bank-red border-t-transparent"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedData}>
              <defs>
                <linearGradient id="usOnThem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#417cd5" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#417cd5" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="themOnUs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" iconType="circle" />

              <Area
                type="monotone"
                dataKey="usOnThem"
                name="Наш клиент — чужой QR"
                stroke="#417cd5"
                fill="url(#usOnThem)"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#417cd5' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="themOnUs"
                name="Наш QR — чужой клиент"
                stroke="#82ca9d"
                fill="url(#themOnUs)"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#82ca9d' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
