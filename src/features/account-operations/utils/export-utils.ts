import * as xlsx from 'xlsx';
import { OperationTransaction } from '../services/account-operations-service';

export const exportAccountOperationsToExcel = (
  transactions: OperationTransaction[],
  accountNumber: string,
  fromDate: string,
  toDate: string
) => {
  const sheetRows = transactions.map((t) => ({
    "Дата документа": t.DOCDOPER || "",
    "Время": t.EXECDT || "",
    "Назначение": t.TXTDSCR || "",
    "Дебет": t.MOVD || "",
    "Кредит": t.MOVC || "",
    "Клиент корреспондент": t.CLIENTCOR || "",
    "Счет корреспондент": t.ACCCOR || "",
    "Банк корреспондент": t.NAMEBCR || "",
    "Оборот по дебету": t.MOVDN || "",
    "Оборот по кредиту": t.MOVCN || "",
    "Дата операции": t.doper || "",
  }));

  const ws = xlsx.utils.json_to_sheet(sheetRows);
  
  // Auto-fit columns
  const keys = Object.keys(sheetRows[0] || {});
  ws["!cols"] = keys.map((k) => {
    const maxLen = Math.max(k.length, ...sheetRows.map((row) => String((row as any)[k] ?? "").length));
    return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
  });

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Операции");
  
  const fileName = `Операции_${accountNumber}_${fromDate}_${toDate}.xlsx`;
  xlsx.writeFile(wb, fileName);
};
