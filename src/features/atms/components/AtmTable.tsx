"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as xlsx from "xlsx";
import { ArrowUpDown, Download, PieChart, Search, AlertCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { fetchATM, fetchHistory } from "../services/atm-service";
import { transformAtm, getRegionGroup, translateIssue } from "../utils/atm-utils";

function parseSortableId(v: any) {
  const s = String(v ?? "").trim();
  const num = Number(s);
  if (Number.isFinite(num)) return { type: "num", value: num, raw: s };
  return { type: "str", value: s, raw: s };
}

function compareId(a: any, b: any) {
  const A = parseSortableId(a);
  const B = parseSortableId(b);

  if (A.type === "num" && B.type === "num") return A.value - B.value;
  if (A.type !== B.type) return A.type === "num" ? -1 : 1;
  return A.value.localeCompare(B.value, "ru", {
    numeric: true,
    sensitivity: "base",
  });
}

const ListChips = ({ items = [], kind = "error" }: { items?: any[]; kind?: "error" | "warning" }) => {
  if (!items?.length) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((it, i) => {
        const ru = translateIssue(it, kind);
        const en =
          typeof it === "string" || typeof it === "number"
            ? it
            : (it?.message ?? it?.text ?? it?.code ?? "");

        return (
          <Badge
            key={`${kind}-${i}`}
            variant={kind === "error" ? "destructive" : "secondary"}
            className={kind === "warning" ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200" : ""}
            title={en ? `EN: ${en}` : ""}
          >
            {ru || "—"}
          </Badge>
        );
      })}
    </div>
  );
};

export const AtmTable = () => {
  const router = useRouter();
  
  const [atmData, setAtmData] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idQuery, setIdQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" | null }>({
    key: "total",
    direction: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const todayStr = new Date().toISOString().slice(0, 10);
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        const [atms, hist] = await Promise.all([
          fetchATM(),
          fetchHistory(yesterdayStr, todayStr),
        ]);

        setAtmData(atms || []);
        setHistory(hist || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Ошибка при загрузке данных");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const calcExpenseTjs = (row: any) =>
    (row.tjs200 ?? 0) * 200 +
    (row.tjs100 ?? 0) * 100 +
    (row.tjs50 ?? 0) * 50 +
    (row.tjs20 ?? 0) * 20 +
    (row.tjs10 ?? 0) * 10;

  const yesterdayYYYYMMDD = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  
  const atmIds = useMemo(() => new Set((atmData || []).map((a) => a?.TID)), [atmData]);

  const turnoverMap = useMemo(() => {
    const map = new Map();
    (history || []).forEach((trans) => {
      if (
        atmIds.has(trans.atmId) &&
        Number(trans.amount) > 0 &&
        trans.reversal !== 1 &&
        (trans.responseCode === "-1" || String(trans.responseDescription || "").includes("Успешно")) &&
        trans.localTransactionDate === yesterdayYYYYMMDD
      ) {
        map.set(
          trans.atmId,
          (map.get(trans.atmId) || 0) + Number(trans.amount) / 100
        );
      }
    });
    return map;
  }, [history, atmIds, yesterdayYYYYMMDD]);

  const avgSpentPerDayMap = useMemo(() => {
    const tmp = new Map();

    (history || []).forEach((trans) => {
      if (
        atmIds.has(trans.atmId) &&
        Number(trans.amount) > 0 &&
        trans.reversal !== 1 &&
        (trans.responseCode === "-1" || String(trans.responseDescription || "").includes("Успешно"))
      ) {
        const day = String(trans.localTransactionDate || "").slice(0, 10);
        if (!day) return;

        const sum = Number(trans.amount) / 100;

        if (!tmp.has(trans.atmId)) tmp.set(trans.atmId, { sum: 0, days: new Set() });
        const obj = tmp.get(trans.atmId);

        obj.sum += sum;
        obj.days.add(day);
      }
    });

    const res = new Map();
    for (const [atmId, obj] of tmp.entries()) {
      const daysCount = Math.max(1, obj.days.size);
      res.set(atmId, obj.sum / daysCount);
    }

    return res;
  }, [history, atmIds]);

  const rows = useMemo(() => {
    return (atmData || []).map((atm) => {
      const base = transformAtm(atm);
      const turnover = turnoverMap.get(atm?.TID) || 0;
      const avgSpentPerDay = avgSpentPerDayMap.get(atm?.TID) || 0;

      return {
        ...base,
        turnoverYesterday: turnover,
        balancePlusTurnover: base.balanceTjs + turnover,
        avgSpentPerDay,
      };
    });
  }, [atmData, turnoverMap, avgSpentPerDayMap]);

  const filteredRows = useMemo(() => {
    const q = String(idQuery || "").trim();
    if (!q) return rows;
    return rows.filter((r) => String(r.id ?? "").includes(q));
  }, [rows, idQuery]);

  const sortedRows = useMemo(() => {
    const arr = [...filteredRows];
    const { key, direction: dir } = sort;
    if (!dir) return arr;

    const mul = dir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      let cmp = 0;

      if (key === "total") cmp = calcExpenseTjs(a) - calcExpenseTjs(b);
      else if (key === "id") cmp = compareId(a.id, b.id);
      else if (key === "turnover") cmp = (a.turnoverYesterday || 0) - (b.turnoverYesterday || 0);
      else if (key === "balancePlusTurnover") cmp = (a.balancePlusTurnover || 0) - (b.balancePlusTurnover || 0);
      else if (key === "daysEnough") {
        const da = a.avgSpentPerDay > 0 ? a.balanceTjs / a.avgSpentPerDay : -1;
        const db = b.avgSpentPerDay > 0 ? b.balanceTjs / b.avgSpentPerDay : -1;
        cmp = da - db;
      } else if (key === "errors") cmp = (a.errors?.length ? 1 : 0) - (b.errors?.length ? 1 : 0);
      else if (key === "warnings") cmp = (a.warnings?.length ? 1 : 0) - (b.warnings?.length ? 1 : 0);

      cmp *= mul;
      if (cmp === 0) cmp = compareId(a.id, b.id);
      return cmp;
    });

    return arr;
  }, [filteredRows, sort]);

  const clickSort = (key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "desc" };

      let nextDir: "asc" | "desc" | null = null;
      if (prev.direction === "desc") nextDir = "asc";
      else if (prev.direction === "asc") nextDir = null;
      else nextDir = "desc";

      return { key, direction: nextDir };
    });
  };

  const GROUP_ORDER = [
    "Душанбе",
    "НТЧ",
    "Вилояти Суғд",
    "Минтақаи Бохтар",
    "Минтақаи Қӯлоб",
    "ГБАО",
    "Прочие",
  ];

  const exportToExcel = () => {
    const sheetRows = sortedRows.map((r) => {
      const daysEnough = r.avgSpentPerDay > 0 ? r.balanceTjs / r.avgSpentPerDay : null;

      return {
        Локация: r.location,
        ID: r.id,
        Область: r.region,
        Адрес: r.address,

        "USD 100": r.usd100,
        "TJS 200": r.tjs200,
        "TJS 100": r.tjs100,
        "TJS 50": r.tjs50,
        "TJS 20": r.tjs20,
        "TJS 10": r.tjs10,

        "Всего (TJS)": calcExpenseTjs(r),
        "Остаток (TJS)": r.balanceTjs,
        "Оборот (вчера)": r.turnoverYesterday,
        "Остаток+Оборот (вчера)": r.balancePlusTurnover,

        "Хватит (дней)": daysEnough == null ? "" : Number(daysEnough).toFixed(1),
        "Расход/день (средний)": r.avgSpentPerDay ? Number(r.avgSpentPerDay).toFixed(0) : "",
      };
    });

    const ws = xlsx.utils.json_to_sheet(sheetRows);
    const keys = Object.keys(sheetRows[0] || {});
    ws["!cols"] = keys.map((k) => {
      const maxLen = Math.max(k.length, ...sheetRows.map((row) => String((row as any)[k] ?? "").length));
      return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
    });

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "ATM");
    xlsx.writeFile(wb, `atm_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportSummaryToExcel = () => {
    const grouped: any = {};

    sortedRows.forEach((row) => {
      const group = getRegionGroup(row.region);
      if (!grouped[group]) {
        grouped[group] = { count: 0, balanceTjs: 0, balanceUsd: 0 };
      }
      grouped[group].count += 1;
      grouped[group].balanceTjs += row.balanceTjs ?? 0;
      grouped[group].balanceUsd += row.balanceUsd ?? 0;
    });

    const sortedGroups = [
      ...GROUP_ORDER.filter((g) => grouped[g]),
      ...Object.keys(grouped).filter((g) => !GROUP_ORDER.includes(g)),
    ];

    const sheetRows: any[] = sortedGroups.map((group) => ({
      "Мавқеи ҷойгиршавӣ": group,
      "Миқдори банкоматҳо": grouped[group].count,
      "Бақияи маблағ бо сомонӣ": grouped[group].balanceTjs,
      "Бақияи маблағ бо доллари ИМА": grouped[group].balanceUsd,
    }));

    if (sheetRows.length > 0) {
      sheetRows.push({
        "Мавқеи ҷойгиршавӣ": "Ҳамагӣ",
        "Миқдори банкоматҳо": sheetRows.reduce((s, r) => s + r["Миқдори банкоматҳо"], 0),
        "Бақияи маблағ бо сомонӣ": sheetRows.reduce((s, r) => s + r["Бақияи маблағ бо сомонӣ"], 0),
        "Бақияи маблағ бо доллари ИМА": sheetRows.reduce((s, r) => s + r["Бақияи маблағ бо доллари ИМА"], 0),
      });
    }

    const ws = xlsx.utils.json_to_sheet(sheetRows);
    ws["!cols"] = [{ wch: 28 }, { wch: 20 }, { wch: 26 }, { wch: 30 }];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Отчёт по регионам");
    xlsx.writeFile(wb, `atm_summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const n = (v: any) => Number(v ?? 0).toLocaleString('ru-RU');

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-red-50/50">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Ошибка загрузки данных</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Повторить попытку
        </Button>
      </div>
    );
  }

  const renderSortIcon = (key: string) => {
    if (sort.key !== key || !sort.direction) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    return <ArrowUpDown className={`ml-1 h-3 w-3 ${sort.direction === "desc" ? "text-primary" : "text-primary rotate-180"}`} />;
  };

  return (
    <Card className="flex flex-col h-full border-none shadow-none">
      <CardContent className="p-0 flex flex-col h-full space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по ID банкомата..."
              value={idQuery}
              onChange={(e) => setIdQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={exportSummaryToExcel} disabled={loading} className="w-full sm:w-auto">
              <PieChart className="mr-2 h-4 w-4" /> Отчёт по регионам
            </Button>
            <Button variant="default" onClick={exportToExcel} disabled={loading} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" /> Экспорт в Excel
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border bg-card flex-1 overflow-hidden relative">
          <div className="overflow-auto h-[600px] w-full">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-20 shadow-sm backdrop-blur-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[200px]" colSpan={2}>Расположение</TableHead>
                  <TableHead className="cursor-pointer min-w-[120px] hover:text-primary transition-colors select-none" onClick={() => clickSort("id")}>
                    <div className="flex items-center">ID <span className="text-xs text-muted-foreground ml-1">({sortedRows.length})</span> {renderSortIcon("id")}</div>
                  </TableHead>
                  <TableHead className="min-w-[150px]">Область</TableHead>
                  <TableHead className="min-w-[250px]">Адрес</TableHead>
                  <TableHead className="text-center min-w-[300px]" colSpan={6}>Номиналы TJS/USD</TableHead>
                  <TableHead className="text-right cursor-pointer min-w-[140px] hover:text-primary transition-colors select-none" onClick={() => clickSort("total")}>
                    <div className="flex items-center justify-end">Всего (TJS) {renderSortIcon("total")}</div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer min-w-[140px] hover:text-primary transition-colors select-none" onClick={() => clickSort("turnover")}>
                    <div className="flex items-center justify-end">Оборот (вчера) {renderSortIcon("turnover")}</div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer min-w-[150px] hover:text-primary transition-colors select-none" onClick={() => clickSort("balancePlusTurnover")}>
                    <div className="flex items-center justify-end">Остаток+Оборот {renderSortIcon("balancePlusTurnover")}</div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer min-w-[140px] hover:text-primary transition-colors select-none" onClick={() => clickSort("daysEnough")}>
                    <div className="flex items-center justify-end" title="Остаток / средний расход в день">Хватит (дней) {renderSortIcon("daysEnough")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer min-w-[200px] hover:text-primary transition-colors select-none" onClick={() => clickSort("errors")}>
                    <div className="flex items-center">Ошибки {renderSortIcon("errors")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer min-w-[200px] hover:text-primary transition-colors select-none" onClick={() => clickSort("warnings")}>
                    <div className="flex items-center">Предупреждения {renderSortIcon("warnings")}</div>
                  </TableHead>
                </TableRow>
                <TableRow className="bg-muted/30 hover:bg-transparent text-xs text-muted-foreground">
                  <TableHead colSpan={2} className="h-8"></TableHead>
                  <TableHead className="h-8"></TableHead>
                  <TableHead className="h-8"></TableHead>
                  <TableHead className="h-8"></TableHead>
                  <TableHead className="h-8 text-center bg-blue-50/50 dark:bg-blue-900/20">100$</TableHead>
                  <TableHead className="h-8 text-center bg-green-50/50 dark:bg-green-900/20">200с</TableHead>
                  <TableHead className="h-8 text-center bg-green-50/50 dark:bg-green-900/20">100с</TableHead>
                  <TableHead className="h-8 text-center bg-green-50/50 dark:bg-green-900/20">50с</TableHead>
                  <TableHead className="h-8 text-center bg-green-50/50 dark:bg-green-900/20">20с</TableHead>
                  <TableHead className="h-8 text-center bg-green-50/50 dark:bg-green-900/20">10с</TableHead>
                  <TableHead colSpan={6} className="h-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={17} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-muted-foreground">Загрузка данных банкоматов...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="h-64 text-center">
                      <p className="text-muted-foreground">Нет данных по заданным критериям поиска</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRows.map((row, idx) => {
                    const daysEnough = row.avgSpentPerDay > 0 ? row.balanceTjs / row.avgSpentPerDay : null;
                    return (
                      <TableRow key={`${row.id}-${idx}`} className="hover:bg-muted/50 transition-colors">
                        <TableCell colSpan={2} className="font-medium max-w-[200px] truncate" title={row.location}>{row.location}</TableCell>
                        <TableCell className="font-mono text-xs">{row.id}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={row.region}>{row.region}</TableCell>
                        <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground" title={row.address}>{row.address}</TableCell>
                        
                        <TableCell className="text-center font-mono bg-blue-50/30 dark:bg-blue-900/10">{n(row.usd100)}</TableCell>
                        <TableCell className="text-center font-mono bg-green-50/30 dark:bg-green-900/10">{n(row.tjs200)}</TableCell>
                        <TableCell className="text-center font-mono bg-green-50/30 dark:bg-green-900/10">{n(row.tjs100)}</TableCell>
                        <TableCell className="text-center font-mono bg-green-50/30 dark:bg-green-900/10">{n(row.tjs50)}</TableCell>
                        <TableCell className="text-center font-mono bg-green-50/30 dark:bg-green-900/10">{n(row.tjs20)}</TableCell>
                        <TableCell className="text-center font-mono bg-green-50/30 dark:bg-green-900/10">{n(row.tjs10)}</TableCell>

                        <TableCell className="text-right font-semibold whitespace-nowrap">{n(calcExpenseTjs(row))}</TableCell>
                        <TableCell className="text-right whitespace-nowrap text-muted-foreground">{n(row.turnoverYesterday)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">{n(row.balancePlusTurnover)}</TableCell>
                        
                        <TableCell className="text-right">
                          {daysEnough === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <Badge variant={daysEnough < 1.5 ? "destructive" : daysEnough < 3 ? "secondary" : "outline"} className={daysEnough >= 3 ? "bg-green-50 text-green-700 border-green-200" : ""}>
                              {daysEnough.toFixed(1)}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="max-w-[250px]">
                          <ListChips items={row.errors} kind="error" />
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <ListChips items={row.warnings} kind="warning" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
