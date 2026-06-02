import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Credit } from "../types";
import { loanSoapService } from "../services/loan-service";
import { absService } from "../services/abs-service";

interface CreditCardItemProps {
  credit: Credit;
  onOpenDetails: (referenceId: string) => void;
}

const DEPARTMENTS_MAP: Record<string, string> = {
  "6100": "Мудирияти Амалиёти ш.Душанбе",
};

export const CreditCardItem: React.FC<CreditCardItemProps> = ({
  credit,
  onOpenDetails,
}) => {
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);
  const [percentRate, setPercentRate] = useState<string | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [nextPaymentDate, setNextPaymentDate] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isLoadingGraph, setIsLoadingGraph] = useState(true);

  useEffect(() => {
    let ignore = false;

    let timerDetails: ReturnType<typeof setTimeout>;
    let timerGraph: ReturnType<typeof setTimeout>;

    if (credit.referenceId) {
      timerDetails = setTimeout(() => {
        setIsLoadingDetails(true);
        loanSoapService
          .getLoanDetails(credit.referenceId!)
          .then((details: any) => {
            if (ignore) return;
            if (details && details.balances) {
              const sum = details.balances.reduce(
                (acc: number, b: any) => acc + Number(b.balance || 0),
                0,
              );
              setRemainingBalance(sum);
            }
            if (details && details.percentRate) {
              setPercentRate(details.percentRate);
            }
          })
          .catch(console.error)
          .finally(() => {
            if (!ignore) setIsLoadingDetails(false);
          });
      }, 0);

      timerGraph = setTimeout(() => {
        setIsLoadingGraph(true);
        absService
          .getCreditGraphs(credit.referenceId!)
          .then((graphs: any[]) => {
            if (ignore) return;
            if (graphs && graphs.length > 0) {
              const byDate: Record<string, any[]> = {};
              graphs.forEach((g) => {
                const date = g.PaymentDate;
                if (date) {
                  if (!byDate[date]) byDate[date] = [];
                  byDate[date].push(g);
                }
              });

              const sortedDates = Object.keys(byDate).sort(
                (a, b) => new Date(a).getTime() - new Date(b).getTime(),
              );
              const now = new Date().getTime();
              let targetDate = sortedDates.find(
                (d) => new Date(d).getTime() >= now,
              );
              if (!targetDate && sortedDates.length > 0) {
                targetDate = sortedDates[sortedDates.length - 1];
              }

              if (targetDate) {
                const payments = byDate[targetDate];
                let sum = 0;
                payments.forEach((p) => {
                  if (
                    p.LongName === "Основной долг" ||
                    p.LongName === "Проценты по кредиту"
                  ) {
                    sum += Number(p.Amount || 0);
                  }
                });
                setMonthlyPayment(sum);
                setNextPaymentDate(targetDate);
              }
            }
          })
          .catch(console.error)
          .finally(() => {
            if (!ignore) setIsLoadingGraph(false);
          });
      }, 0);
    } else {
      setTimeout(() => {
        setIsLoadingDetails(false);
        setIsLoadingGraph(false);
      }, 0);
    }

    return () => {
      ignore = true;
      clearTimeout(timerDetails);
      clearTimeout(timerGraph);
    };
  }, [credit.referenceId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatMoney = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return num
      .toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(",", ".");
  };

  const departmentText = credit.department
    ? DEPARTMENTS_MAP[credit.department] || credit.department
    : "-";

  const creditAmount = Number(credit.amount || 0);
  let progressPercent = 0;
  if (creditAmount > 0 && remainingBalance !== null) {
    progressPercent = ((creditAmount - remainingBalance) / creditAmount) * 100;
    progressPercent = Math.max(0, Math.min(100, progressPercent));
  }

  return (
    <Card className="rounded-3xl p-6 bg-white border-none shadow-sm flex flex-col gap-6 relative overflow-hidden">
      {}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">
              {credit.productName?.replace(/\\"/g, '"') || "-"}
            </h3>
            {credit.statusName && (
              <Badge className="bg-[#65a30d] hover:bg-[#65a30d] text-white px-3 py-0.5 rounded-full text-xs font-normal border-none">
                {credit.statusName}
              </Badge>
            )}
          </div>
          <div className="text-sm text-slate-400">
            Дата открытия: {formatDate(credit.documentDate)} | Отдел:{" "}
            {departmentText}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">
            Остаток задолженности
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {isLoadingDetails ? (
              <div className="h-8 w-32 bg-slate-100 animate-pulse rounded ml-auto"></div>
            ) : (
              <>
                {formatMoney(remainingBalance)} {credit.currency || "TJS"}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs text-slate-400">Погашено</div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#b91c1c] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between items-end pt-2">
        <div className="flex gap-16">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Сумма кредита</div>
            <div className="font-bold text-lg text-slate-800">
              {formatMoney(creditAmount)} {credit.currency || "TJS"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">% Ставка</div>
            <div className="font-bold text-lg text-[#65a30d]">
              {isLoadingDetails ? (
                <div className="h-7 w-12 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <>{percentRate ? `${percentRate} %` : "-"}</>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Ежемесячный платёж</div>
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg text-slate-800">
                {isLoadingGraph ? (
                  <div className="h-7 w-24 bg-slate-100 animate-pulse rounded"></div>
                ) : (
                  <>
                    {formatMoney(monthlyPayment)} {credit.currency || "TJS"}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Дата платежа</div>
            <div className="font-bold text-lg text-slate-800">
              {isLoadingGraph ? (
                <div className="h-7 w-24 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <>
                  {nextPaymentDate
                    ? formatDate(nextPaymentDate.split(" ")[0])
                    : "-"}
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="link"
          className="text-[#b91c1c] p-0 h-auto font-medium hover:no-underline hover:opacity-80"
          onClick={() =>
            credit.referenceId && onOpenDetails(credit.referenceId)
          }
        >
          Подробнее
        </Button>
      </div>
    </Card>
  );
};
