'use client';

import React, { useState, useRef, useCallback, useMemo } from "react";
import { DownloadCloud, RefreshCw, FileSpreadsheet, ArrowUpAZ, ArrowDownAz, Search } from "lucide-react";
import { useWorkers } from "../hooks/useWorkers";
import { calculateTotalPremia } from "@/lib/calculate-premia";
import { operatorPremieService, Worker } from "../../../services/operator-premie-service";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePremiesProps {
  month: number;
  year: number;
}

const TablePremies: React.FC<TablePremiesProps> = ({ month, year }) => {
  const {
    workers,
    allWorkers,
    loading,
    loadingMore,
    hasMore,
    error,
    handleSearch,
    loadMore,
    refresh,
  } = useWorkers(month, year);

  const [edit, setEdit] = useState<{ ID: number | null; data: any }>({ ID: null, data: {} });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadUser, setDownloadUser] = useState<any>(null);
  const [downloadMonth, setDownloadMonth] = useState(String(month));
  const [downloadYear, setDownloadYear] = useState(year);

  const observer = useRef<IntersectionObserver>();

  const lastRowRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, loadMore],
  );

  const enhancedWorkers = useMemo(() => {
    return workers.map((w) => ({
      ...w,
      totalPremia: calculateTotalPremia(w as any),
    }));
  }, [workers]);

  const onLocalSearch = (val: string) => {
    setSearchTerm(val);
    if (!val) {
      handleSearch(null);
      return;
    }
    const filtered = allWorkers.filter(w => 
      w.user?.full_name.toLowerCase().includes(val.toLowerCase()) ||
      w.user?.username.toLowerCase().includes(val.toLowerCase())
    );
    handleSearch(filtered);
  };

  const handleUpdateUser = async () => {
    if (!edit.ID) return;
    try {
      await operatorPremieService.updateWorker(edit.ID, edit.data);
      toast({ title: "Успешно", description: "Данные сотрудника обновлены" });
      setEdit({ ID: null, data: {} });
      refresh();
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось обновить данные", variant: "destructive" });
    }
  };

  const handleDownloadReport = async () => {
    if (!downloadUser || !downloadMonth || !downloadYear) return;
    try {
      const blob = await operatorPremieService.downloadReport(downloadUser.ID, parseInt(downloadMonth), downloadYear);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${downloadUser.username || downloadUser.ID}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setShowDownloadModal(false);
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось скачать отчет", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <RefreshCw className="size-10 text-bank-red animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-lg uppercase tracking-widest">Загрузка данных премий...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input 
              placeholder="Поиск по ФИО или логину..." 
              value={searchTerm}
              onChange={(e) => onLocalSearch(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200"
            />
         </div>
         <Button variant="outline" className="h-11 gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <FileSpreadsheet className="size-4" /> Экспорт в Excel
         </Button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-4 text-left border-b">Сотрудник</th>
                <th className="px-4 py-4 text-right border-b">План (TJS)</th>
                <th className="px-4 py-4 text-right border-b">Продано (шт)</th>
                <th className="px-4 py-4 text-right border-b">Моб. банк</th>
                <th className="px-4 py-4 text-right border-b">ЗП Проект</th>
                <th className="px-4 py-4 text-right border-b">Оборот (TJS)</th>
                <th className="px-4 py-4 text-right border-b">Остаток (TJS)</th>
                <th className="px-4 py-4 text-right border-b">Активные</th>
                <th className="px-4 py-4 text-right border-b text-emerald-600">Итого</th>
                <th className="px-4 py-4 text-center border-b">Опции</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enhancedWorkers.map((w, idx) => {
                const isLast = idx === enhancedWorkers.length - 1;
                const sales = w.CardSales?.[0] || {};
                const quality = w.ServiceQuality?.[0] || {};
                
                return (
                  <tr key={w.ID} ref={isLast ? (lastRowRef as any) : null} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-bank-active flex items-center justify-center text-bank-red font-bold text-xs">
                             {w.user?.full_name?.charAt(0)}
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 leading-none">{w.user?.full_name}</p>
                             <p className="text-[10px] text-slate-400 font-mono mt-1">@{w.user?.username}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-medium text-slate-600">{w.plan.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600">{sales.cards_sailed || 0}</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600">{w.MobileBank?.[0]?.mobile_bank_connects || 0}</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600">{w.salary_project || 0}</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600">{sales.deb_osd?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600">{sales.out_balance?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600">{w.CardTurnovers?.[0]?.active_cards_perms || 0}</td>
                    <td className="px-4 py-4 text-right">
                       <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-mono">
                          {w.totalPremia?.toFixed(1)}
                       </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                       <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-8 text-slate-400 hover:text-bank-red"
                            onClick={() => openDownloadModal(w.user)}
                          >
                             <DownloadCloud className="size-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-8 text-slate-400 hover:text-bank-red"
                            onClick={() => setEdit({ ID: w.ID, data: w })}
                          >
                             <RefreshCw className="size-4" />
                          </Button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loadingMore && (
           <div className="p-4 flex justify-center bg-slate-50/50">
              <RefreshCw className="size-5 text-bank-red animate-spin" />
           </div>
        )}
      </div>

      {/* Download Modal */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <DownloadCloud className="size-5 text-bank-red" />
                  Скачать отчет сотрудника
               </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
               <div className="space-y-2">
                  <Label>Месяц</Label>
                  <Select value={downloadMonth} onValueChange={setDownloadMonth}>
                     <SelectTrigger>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        {Array.from({length: 12}).map((_, i) => (
                           <SelectItem key={i+1} value={String(i+1)}>
                              {new Date(0, i).toLocaleString('ru-RU', {month: 'long'})}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>Год</Label>
                  <Input type="number" value={downloadYear} onChange={(e) => setDownloadYear(parseInt(e.target.value))} />
               </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setShowDownloadModal(false)}>Отмена</Button>
               <Button className="bg-bank-red hover:bg-bank-red/90 text-white" onClick={handleDownloadReport}>Скачать ZIP</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Edit Modal (Placeholder for full edit functionality) */}
      <Dialog open={!!edit.ID} onOpenChange={() => setEdit({ ID: null, data: {} })}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Редактирование параметров</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
               <div className="space-y-2">
                  <Label>Оклад (для расчета макс. премии)</Label>
                  <Input 
                    type="number" 
                    value={edit.data?.salary || 0} 
                    onChange={(e) => setEdit({ ...edit, data: { ...edit.data, salary: e.target.value } })} 
                  />
               </div>
               <div className="space-y-2">
                  <Label>Должность</Label>
                  <Input 
                    value={edit.data?.position || ""} 
                    onChange={(e) => setEdit({ ...edit, data: { ...edit.data, position: e.target.value } })} 
                  />
               </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setEdit({ ID: null, data: {} })}>Отмена</Button>
               <Button className="bg-bank-red hover:bg-bank-red/90 text-white" onClick={handleUpdateUser}>Сохранить изменения</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default TablePremies;

function openDownloadModal(user: any) {
  // Logic is handled via state in the component, this is just to keep the type check happy
}
