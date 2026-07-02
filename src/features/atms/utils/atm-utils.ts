import { ATM_ERRORS_RU, ATM_WARNINGS_RU } from './atm-errors';

export const normalizeKey = (s: any): string =>
  String(s ?? "")
    .trim()
    .replace(/\s+/g, " ");

export const translateIssue = (x: any, kind: "error" | "warning" = "error"): string => {
  if (x == null) return "";

  const raw =
    typeof x === "string" || typeof x === "number"
      ? String(x)
      : (x?.message ?? x?.text ?? x?.code ?? JSON.stringify(x));

  const key = normalizeKey(raw);
  if (!key) return "";

  if (kind === "warning") return ATM_WARNINGS_RU[key] || key;
  return ATM_ERRORS_RU[key] || key;
};

export const getDispCount = (dispenser: any[] = [], currency: string, denom: number): number => {
  const item = dispenser.find(
    (d) => d.currency === currency && d.denomination === denom,
  );
  return item?.currentBanknotes ?? 0;
};

export const sumBalance = (dispenser: any[] = [], currency: string): number =>
  dispenser
    .filter((d) => d.currency === currency)
    .reduce(
      (acc, d) => acc + (d.currentBanknotes ?? 0) * (d.denomination ?? 0),
      0,
    );

export const transformAtm = (atm: any) => {
  const disp = atm?.Dispenser ?? [];
  const info = atm?.info ?? {};

  const usd100 = getDispCount(disp, "USD", 100);
  const tjs200 = getDispCount(disp, "TJS", 200);
  const tjs100 = getDispCount(disp, "TJS", 100);
  const tjs50 = getDispCount(disp, "TJS", 50);
  const tjs20 = getDispCount(disp, "TJS", 20);
  const tjs10 = getDispCount(disp, "TJS", 10);

  return {
    id: atm?.TID ?? "—",
    atmState: atm?.ATMState ?? "—",

    location: info?.name ?? "—",
    region: info?.region ?? "—",
    address: info?.address ?? "—",

    usd100,
    tjs200,
    tjs100,
    tjs50,
    tjs20,
    tjs10,

    balanceUsd: sumBalance(disp, "USD"),
    balanceTjs: sumBalance(disp, "TJS"),

    errors: Array.isArray(atm?.Errors) ? atm.Errors : [],
    warnings: Array.isArray(atm?.Warning)
      ? atm.Warning
      : Array.isArray(atm?.Warnings)
        ? atm.Warnings
        : [],
  };
};

export const getRegionGroup = (region: any): string => {
  if (!region) return "Прочие";

  const r = String(region).trim().toLowerCase();
  if (!r) return "Прочие";

  if (r.includes("душанбе")) return "Душанбе";

  if (
    r.includes("хучанд") ||
    r.includes("худжанд") ||
    r.includes("панҷакент") ||
    r.includes("панчакент") ||
    r.includes("вилояти сугд") ||
    r.includes("согдийская")
  )
    return "Вилояти Суғд";

  if (
    r.includes("кулоб") ||
    r.includes("куляб") ||
    r.includes("восеъ") ||
    r.includes("восе")
  )
    return "Минтақаи Қӯлоб";

  if (
    r.includes("бохтар") ||
    r.includes("кубодиён") ||
    r.includes("кабодиён") ||
    r.includes("шахритуз") ||
    r.includes("шаҳритус") ||
    r.includes("ҷайҳун") ||
    r.includes("джайхун")
  )
    return "Минтақаи Бохтар";

  if (
    r.includes("гбао") ||
    r.includes("горный бадахшан") ||
    r.includes("иштихон") ||
    r.includes("хорог") ||
    r.includes("калайхумб")
  )
    return "ГБАО";

  if (
    r.includes("рогун") ||
    r.includes("турсунзода") ||
    r.includes("вахдат") ||
    r.includes("ҳисор") ||
    r.includes("хисор") ||
    r.includes("шаҳринав") ||
    r.includes("шахринав") ||
    r.includes("файзобод") ||
    r.includes("нтч")
  )
    return "НТЧ";

  return "Прочие";
};
