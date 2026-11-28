"use client";

import React, { useEffect, useRef, useState } from "react";

import { apiFetch, ApiRequestError } from "../../../lib/api";
import { categoryColorForId } from "../../../lib/categoryColors";
import type { AccountType, MonthlyBudget } from "../../../types/api";
import type p5 from "p5";

type ChartMode = "totals" | "categories";

interface ChartCategory {
  id: number;
  name: string;
  color: string;
  planned: (number | null)[];
  spent: (number | null)[];
}

interface BackendAccount {
  id: number;
  name: string;
  type: AccountType;
  currency?: string;
}
interface BackendTransaction {
  date: string;
}
interface BackendCategory {
  id: number;
  categoryLabel: string;
}

interface UserStats {
  budgetsCreated: number;
  monthsWithinBudget: number;
  currentStreak: number;
}

function previousMonth(month: string) {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  if (monthNumber === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(monthNumber - 1).padStart(2, "0")}`;
}

function calculateUserStats(budgets: MonthlyBudget[]): UserStats {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const budgetByMonth = new Map<string, MonthlyBudget>();
  for (const budget of budgets) {
    budgetByMonth.set(budget.month, budget);
  }

  const hasBudget = (budget: MonthlyBudget) => Number(budget.totalPlanned) > 0;
  const stayedWithinBudget = (budget: MonthlyBudget) =>
    hasBudget(budget) && Number(budget.totalSpent) <= Number(budget.totalPlanned);

  let currentStreak = 0;
  let month = previousMonth(currentMonth);
  while (budgetByMonth.has(month)) {
    const budget = budgetByMonth.get(month);
    if (!budget || !stayedWithinBudget(budget)) break;
    currentStreak += 1;
    month = previousMonth(month);
  }

  return {
    budgetsCreated: budgets.filter(hasBudget).length,
    monthsWithinBudget: budgets.filter(
      (budget) => budget.month < currentMonth && stayedWithinBudget(budget),
    ).length,
    currentStreak,
  };
}

function chartCategories(budgets: MonthlyBudget[], categoryOrder: number[]): ChartCategory[] {
  const categories = new Map<number, Omit<ChartCategory, "planned" | "spent">>();
  for (const budget of budgets) {
    for (const category of budget.categories) {
      if (!categories.has(category.categoryId)) {
        categories.set(category.categoryId, {
          id: category.categoryId,
          name: category.categoryName,
          color: categoryColorForId(category.categoryId),
        });
      }
    }
  }
  const orderedIds = [
    ...categoryOrder,
    ...Array.from(categories.keys()).filter((id) => !categoryOrder.includes(id)),
  ];
  return orderedIds.flatMap((id) => {
    const category = categories.get(id);
    if (!category) return [];
    const monthlyAmounts = budgets.map((budget) => {
      const monthCategory = budget.categories.find((item) => item.categoryId === id);
      return {
        planned: Number(monthCategory?.planned ?? 0),
        spent: Number(monthCategory?.spent ?? 0),
      };
    });
    const hasEntryAt = (index: number) => {
      const amounts = monthlyAmounts[index];
      return amounts !== undefined && (amounts.planned !== 0 || amounts.spent !== 0);
    };
    const hasNeighborEntry = (index: number) => hasEntryAt(index - 1) || hasEntryAt(index + 1);
    return [{
      ...category,
      planned: monthlyAmounts.map((amounts, index) =>
        amounts.planned === 0 && amounts.spent === 0 && !hasNeighborEntry(index)
          ? null
          : amounts.planned,
      ),
      spent: monthlyAmounts.map((amounts, index) =>
        amounts.planned === 0 && amounts.spent === 0 && !hasNeighborEntry(index)
          ? null
          : amounts.spent,
      ),
    }];
  });
}

function drawChartAxes(p5: p5, budgets: MonthlyBudget[], maxValue: number) {
  const left = 58;
  const right = p5.width - 24;
  const top = 36;
  const bottom = p5.height - 54;
  const groupWidth = (right - left) / budgets.length;
  const xFor = (index: number) => left + groupWidth * (index + 0.5);
  const yFor = (value: number) => bottom - (value / maxValue) * (bottom - top);

  p5.stroke("#cfe0cf");
  p5.strokeWeight(1);
  p5.line(left, top, left, bottom);
  p5.line(left, bottom, right, bottom);
  p5.stroke("#e4efe3");
  p5.line(left, (top + bottom) / 2, right, (top + bottom) / 2);
  p5.noStroke();
  p5.fill("#7a8580");
  p5.textAlign(p5.CENTER, p5.CENTER);
  budgets.forEach((budget, index) => {
    p5.text(budget.month, xFor(index), bottom + 22);
  });

  return { left, bottom, xFor, yFor };
}

function drawBudgetChart(p5: p5, budgets: MonthlyBudget[]) {
  p5.background("#fffdf7");
  p5.textSize(12);
  p5.textAlign(p5.CENTER, p5.CENTER);

  if (budgets.length === 0) return;

  const highestPlanned = Math.max(...budgets.map((budget) => Number(budget.totalPlanned)));
  const highestSpent = Math.max(...budgets.map((budget) => Number(budget.totalSpent)));
  const maxValue = Math.max(1, Math.ceil(Math.max(highestPlanned, highestSpent) * 1.1));
  const { left, xFor, yFor } = drawChartAxes(p5, budgets, maxValue);

  const drawSeries = (valueFor: (budget: MonthlyBudget) => number, color: string) => {
    p5.stroke(color);
    p5.strokeWeight(3);
    budgets.forEach((budget, index) => {
      const previousBudget = budgets[index - 1];
      if (previousBudget) {
        p5.line(
          xFor(index - 1),
          yFor(valueFor(previousBudget)),
          xFor(index),
          yFor(valueFor(budget)),
        );
      }
    });

    p5.noStroke();
    p5.fill(color);
    budgets.forEach((budget, index) => {
      p5.circle(xFor(index), yFor(valueFor(budget)), 7);
    });
  };
  drawSeries((budget) => Number(budget.totalPlanned), "#3e8e5a");
  drawSeries((budget) => Number(budget.totalSpent), "#b5574b");

  p5.noStroke();
  p5.fill("#3f4a45");
  p5.textAlign(p5.LEFT, p5.CENTER);
  p5.text("Planned", left, 16);
  p5.text("Spent", left + 90, 16);
  p5.text("Monthly planned and spent totals", p5.width / 2, p5.height - 10);
  p5.stroke("#3e8e5a");
  p5.strokeWeight(3);
  p5.line(left - 14, 16, left - 4, 16);
  p5.fill("#3f4a45");

  p5.stroke("#b5574b");
  p5.line(left + 76, 16, left + 86, 16);
}

function drawCategoryChart(
  p5: p5,
  budgets: MonthlyBudget[],
  categories: ChartCategory[],
) {
  p5.background("#fffdf7");
  p5.textSize(12);
  p5.textAlign(p5.CENTER, p5.CENTER);

  if (budgets.length === 0) return;

  const values = categories
    .flatMap((category) => [...category.planned, ...category.spent])
    .filter((value): value is number => value !== null);
  const maxValue = Math.max(1, Math.ceil(Math.max(...values, 0) * 1.1));
  const { left, xFor, yFor } = drawChartAxes(p5, budgets, maxValue);
  const monthlyHighs = budgets.map((_, monthIndex) =>
    categories.reduce(
      (highest, category) =>
        Math.max(
          highest,
          category.planned[monthIndex] ?? 0,
          category.spent[monthIndex] ?? 0,
        ),
      0,
    ),
  );
  const minimumOpacity = 0.65;
  const opacityFor = (amount: number, monthIndex: number) => {
    const highest = monthlyHighs[monthIndex] ?? 0;
    const relativeAmount = highest > 0 ? amount / highest : 0;
    return minimumOpacity + (1 - minimumOpacity) * relativeAmount;
  };
  const setLineDash = (segments: number[]) => {
    const context = p5.drawingContext;
    if ("setLineDash" in context) context.setLineDash(segments);
  };
  const setGlobalAlpha = (alpha: number) => {
    const context = p5.drawingContext;
    if ("globalAlpha" in context) context.globalAlpha = alpha;
  };

  const drawCategoryLine = (amounts: (number | null)[], color: string, dashed: boolean) => {
    p5.stroke(color);
    p5.strokeWeight(2);
    setLineDash(dashed ? [6, 4] : []);
    amounts.forEach((amount, index) => {
      const previousAmount = amounts[index - 1];
      if (amount !== null && previousAmount !== null && previousAmount !== undefined) {
        const segmentOpacity = (
          opacityFor(previousAmount, index - 1) + opacityFor(amount, index)
        ) / 2;
        setGlobalAlpha(segmentOpacity);
        p5.line(xFor(index - 1), yFor(previousAmount), xFor(index), yFor(amount));
        setGlobalAlpha(1);
      }
    });
    setLineDash([]);

    amounts.forEach((amount, index) => {
      if (amount === null) return;
      setGlobalAlpha(opacityFor(amount, index));
      if (dashed) {
        p5.noFill();
        p5.stroke(color);
        p5.strokeWeight(2);
      } else {
        p5.noStroke();
        p5.fill(color);
      }
      p5.circle(xFor(index), yFor(amount), 6);
      setGlobalAlpha(1);
    });
  };

  for (const category of categories) {
    drawCategoryLine(category.planned, category.color, true);
    drawCategoryLine(category.spent, category.color, false);
  }

  p5.noStroke();
  p5.textAlign(p5.LEFT, p5.CENTER);
  p5.fill("#3f4a45");
  p5.text("Planned", left, 16);
  p5.text("Spent", left + 90, 16);
  p5.stroke("#3f4a45");
  p5.strokeWeight(3);
  setLineDash([6, 4]);
  p5.line(left - 34, 16, left - 4, 16);
  setLineDash([]);
  p5.line(left + 76, 16, left + 86, 16);
  p5.noStroke();
  p5.fill("#7a8580");
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.text("Category planned and spent by month", p5.width / 2, p5.height - 10);
}

function BudgetChart({
  budgets,
  mode,
  categoryOrder,
}: {
  budgets: MonthlyBudget[];
  mode: ChartMode;
  categoryOrder: number[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const budgetsRef = useRef(budgets);
  budgetsRef.current = budgets;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const categories = chartCategories(budgets, categoryOrder);
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  useEffect(() => {
    let active = true;
    let instance: p5 | undefined;

    void import("p5").then(({ default: P5 }) => {
      if (!active || !containerRef.current) return;

      instance = new P5((sketch) => {
        sketch.setup = () => {
          sketch.createCanvas(600, 400);
        };
        sketch.draw = () => {
          if (modeRef.current === "categories") {
            drawCategoryChart(sketch, budgetsRef.current, categoriesRef.current);
          } else {
            drawBudgetChart(sketch, budgetsRef.current);
          }
        };
      }, containerRef.current);
    });

    return () => {
      active = false;
      instance?.remove();
      containerRef.current?.replaceChildren();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="canvas-container flex min-h-[400px] items-center justify-center"
      />
      {mode === "categories" && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#7A8580]">
          {categories.map((category) => (
            <span key={category.id} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
              {category.name}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

//  main  //
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<number[]>([]);
  const [monthsToShow, setMonthsToShow] = useState<number | "all">(6);
  const [chartMode, setChartMode] = useState<ChartMode>("totals");
  const chartBudgets =
    monthsToShow === "all" ? monthlyBudgets : monthlyBudgets.slice(-monthsToShow);
  const userStats = calculateUserStats(monthlyBudgets);

  //Load transactions first so the budgets can cover the full transaction month range.
  useEffect(() => {
    async function load() {
      try {
        const [accountData, categoryData] = await Promise.all([
          apiFetch<BackendAccount[] | { accounts: BackendAccount[] }>("/api/accounts"),
          apiFetch<BackendCategory[]>("/api/categories"),
        ]);
        setCategoryOrder(categoryData.map((category) => category.id));
        const accountList = Array.isArray(accountData) ? accountData : accountData.accounts;
        const transactionResponses = await Promise.all(
          accountList.map((account) =>
            apiFetch<BackendTransaction[] | { transactions: BackendTransaction[] }>(
              `/api/transactions?accountId=${account.id}`,
            ),
          ),
        );
        const transactions = transactionResponses.flatMap((response) =>
          Array.isArray(response) ? response : response.transactions,
        );
        const transactionMonths = transactions.map((transaction) => {
          const month = transaction.date.slice(0, 7);
          if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
            throw new Error("A transaction returned an invalid date.");
          }
          return month;
        });

        if (transactionMonths.length === 0) {
          setMonthlyBudgets([]);
          setLoadError("");
          return;
        }

        const firstMonth = transactionMonths.reduce((first, month) => (month < first ? month : first));
        const lastMonth = transactionMonths.reduce((last, month) => (month > last ? month : last));
        const firstIndex = Number(firstMonth.slice(0, 4)) * 12 + Number(firstMonth.slice(5, 7)) - 1;
        const lastIndex = Number(lastMonth.slice(0, 4)) * 12 + Number(lastMonth.slice(5, 7)) - 1;
        const months = Array.from({ length: lastIndex - firstIndex + 1 }, (_, offset) => {
          const monthIndex = firstIndex + offset;
          const year = Math.floor(monthIndex / 12);
          const month = (monthIndex % 12) + 1;
          return `${year}-${String(month).padStart(2, "0")}`;
        });

        const budgetResponses = await Promise.all(
          months.map((month) =>
            apiFetch<MonthlyBudget | { budget: MonthlyBudget }>(
              `/api/budgets?month=${encodeURIComponent(month)}`,
            ),
          ),
        );
        const budgets = budgetResponses.map((response) =>
          "budget" in response ? response.budget : response,
        );

        setMonthlyBudgets(budgets);
        setLoadError("");
      } catch (e) {
        setLoadError(e instanceof ApiRequestError ? e.message : "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="relative min-h-screen bg-linear-to-b from-[#E4EFE3] via-[#E3EDF1] via-40% to-[#FBF8EF] to-75% px-4 py-8 md:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#9BB5A3_1px,transparent_1px),linear-gradient(90deg,#9BB5A3_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold text-[#3F5747]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#7A8580]">
          Monthly planned and spent totals across your accounts.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-6">
          <section className="rounded-xl border border-white/70 bg-white/60 p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-[#3F5747]">User stats</h2>
            {loading ? (
              <p className="mt-3 text-sm text-[#7A8580]">Loading user stats…</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-[#7A8580]">Budgets created</p>
                  <p className="text-2xl font-semibold text-[#3F4A45]">{userStats.budgetsCreated}</p>
                </div>
                <div>
                  <p className="text-sm text-[#7A8580]">Months within budget</p>
                  <p className="text-2xl font-semibold text-[#3F4A45]">{userStats.monthsWithinBudget}</p>
                </div>
                <div>
                  <p className="text-sm text-[#7A8580]">Current streak</p>
                  <p className="text-2xl font-semibold text-[#3F4A45]">
                    {userStats.currentStreak} months
                  </p>
                </div>
                <p className="text-xs text-[#7A8580]">
                  Stats cover months in the transaction history loaded for this dashboard. Only completed months count toward within-budget totals.
                </p>
              </div>
            )}
          </section>

          <section className="min-w-0 rounded-xl border border-white/70 bg-white/60 p-4 lg:col-span-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#3F5747]">Monthly budget trend</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div
                  role="group"
                  aria-label="Chart type"
                  className="inline-flex rounded-lg border border-[#CFE0CF] bg-white p-1"
                >
                  <button
                    type="button"
                    aria-pressed={chartMode === "totals"}
                    onClick={() => setChartMode("totals")}
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      chartMode === "totals"
                        ? "bg-[#EEF5EC] font-medium text-[#3F5747]"
                        : "text-[#7A8580] hover:text-[#3F4A45]"
                    }`}
                  >
                    Totals
                  </button>
                  <button
                    type="button"
                    aria-pressed={chartMode === "categories"}
                    onClick={() => setChartMode("categories")}
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      chartMode === "categories"
                        ? "bg-[#EEF5EC] font-medium text-[#3F5747]"
                        : "text-[#7A8580] hover:text-[#3F4A45]"
                    }`}
                  >
                    By category
                  </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-[#7A8580]">
                  Months to show
                  <select
                    aria-label="Months shown on graph"
                    value={monthsToShow}
                    onChange={(event) =>
                      setMonthsToShow(event.target.value === "all" ? "all" : Number(event.target.value))
                    }
                    className="rounded-lg border border-[#CFE0CF] bg-white px-3 py-2 text-sm text-[#3F4A45]"
                  >
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={12}>12 months</option>
                    <option value={24}>24 months</option>
                    <option value="all">All months</option>
                  </select>
                </label>
              </div>
            </div>
            <BudgetChart
              budgets={chartBudgets}
              mode={chartMode}
              categoryOrder={categoryOrder}
            />
          </section>
        </div>
        {loadError && <p className="mt-4 text-sm text-[#B5574B]">{loadError}</p>}
      </div>
    </main>
  );
}