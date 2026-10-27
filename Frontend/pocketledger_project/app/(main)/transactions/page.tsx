
"use client";
import {useEffect, useMemo, useState} from "react";
import { Plus, X } from "lucide-react";
import {mockTransactions, mockCategories, mockAccounts} from "../../../mocks";
import {apiFetch, ApiRequestError, checkBackendConnection} from "../../../lib/api";

//Use mock data for now, change to false when accounts are ready in the backend
const USE_MOCK = true;

//Transaction data used on this page
interface Row {
  id: number;
  date: string;
  label: string;
  description: string;
  amount: number; //Negative for expense, positive for income
  categoryId: number;
  accountId: number;
}

//Transaction data returned by the backend
interface BackendTransaction {
  id: number;
  amount: number | string;
  label: string | null;
  description: string | null;
  date: string;
  categoryId: number;
  accountId: number;
}

//Change backend transaction data into the format used on this page
function fromBackend(t: BackendTransaction): Row {
  return {
    id: t.id,
    date: t.date,
    label: t.label ?? "",
    description: t.description ?? "",
    amount: Number(t.amount),
    categoryId: t.categoryId,
    accountId: t.accountId,
  };
}

//Change mock transactions into the same format
const mockRows: Row[] = mockTransactions.map((t) => ({
  id: t.id,
  date: t.date,
  label: t.description,
  description: "",
  amount: Number(t.amount),
  categoryId: t.categoryId,
  accountId: t.accountId,
}));

//Use mock categories and accounts until the backend endpoints are ready
const categories = mockCategories;
const accounts = mockAccounts;

//Find categories and accounts by their ID
const categoryById = new Map(categories.map((c) => [c.id, c]));
const accountById = new Map(accounts.map((a) => [a.id, a]));

//Show money with the correct currency symbol
function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

//Get today's date for the transaction form
function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

//Shared style for the form inputs
const inputClass =
  "mt-1 w-full rounded-lg border border-[#CFE0CF] bg-white px-3 py-2 text-[#3F4A45] focus:outline-none focus:ring-2 focus:ring-[#A9C9B0]";

export default function TransactionsPage() {
  //Store transactions and selected account
  const [rows, setRows] = useState<Row[]>(USE_MOCK ? mockRows : []);
  const [accountFilter, setAccountFilter] = useState<number | "all">("all");

  //Store loading, error, and form states
  const [loading, setLoading] = useState(!USE_MOCK);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [backendStatus, setBackendStatus] = useState("");

  //Load transactions from the backend when mock data is off
  useEffect(() => {
    if (USE_MOCK) return;

    //Get transactions for the selected account or all accounts
    const ids = accountFilter === "all" ? accounts.map((a) => a.id) : [accountFilter];

    Promise.all(
      ids.map((id) => apiFetch<BackendTransaction[] | { transactions: BackendTransaction[] }>(`/api/transactions?accountId=${id}`))
    )
      .then((results) => {
        //Get transactions from either backend response format
        const all = results.flatMap((r) => (Array.isArray(r) ? r : r.transactions));
        setRows(all.map(fromBackend));
        setLoadError("");
      })
      .catch((e) => setLoadError(e instanceof ApiRequestError ? e.message : "Could not load transactions."))
      .finally(() => setLoading(false));
  }, [accountFilter]);

  //Filter transactions by account and show the newest ones first
  const visible = useMemo(
    () =>
      rows
        .filter((r) => accountFilter === "all" || r.accountId === accountFilter)
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
    [rows, accountFilter]
  );

  //Calculate total income and spending
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    for (const r of visible) {
      if (r.amount >= 0) income += r.amount;
      else expense += r.amount;
    }
    return { income, expense };
  }, [visible]);

  return (
    <main className="relative min-h-screen bg-linear-to-b from-[#E4EFE3] via-[#E3EDF1] via-40% to-[#FBF8EF] to-75% px-4 py-8 md:px-10">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#9BB5A3_1px,transparent_1px),linear-gradient(90deg,#9BB5A3_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative mx-auto max-w-5xl">
        {/* Page title and account filter */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#3F5747]">Transactions</h1>
            <p className="mt-1 text-sm text-[#7A8580]">
              {USE_MOCK ? "Showing sample data." : "Your transactions."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Choose which account to show */}
            <select
              aria-label="Filter by account"
              value={accountFilter}
              onChange={(e) => {
                setLoading(!USE_MOCK);
                setAccountFilter(e.target.value === "all" ? "all" : Number(e.target.value));
              }}
              className="rounded-lg border border-[#CFE0CF] bg-white px-3 py-2 text-sm text-[#3F4A45]"
            >
              <option value="all">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            {/* Open the add transaction form */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] px-4 py-2 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add transaction
            </button>
          </div>
        </div>

        {/* Total income and spending cards */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/70 bg-white/60 p-4">
            <p className="text-sm text-[#7A8580]">Income</p>
            <p className="mt-1 text-xl font-semibold text-[#3E8E5A]">{formatMoney(totals.income, "USD")}</p>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/60 p-4">
            <p className="text-sm text-[#7A8580]">Spending</p>
            <p className="mt-1 text-xl font-semibold text-[#B5574B]">{formatMoney(totals.expense, "USD")}</p>
          </div>
        </div>

        {/* Transaction list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#EDE6D3] bg-[#FFFDF7] shadow-sm">
          {/* Show loading, error, or empty message */}
          {loading && <p className="p-6 text-sm text-[#7A8580]">Loading…</p>}
          {loadError && <p className="p-6 text-sm text-[#B5574B]">{loadError}</p>}
          {!loading && !loadError && visible.length === 0 && (
            <p className="p-6 text-sm text-[#7A8580]">No transactions yet.</p>
          )}

          {/* Show transactions when there is data */}
          {!loading && !loadError && visible.length > 0 && (
            <ul className="divide-y divide-[#EDE6D3]">
              {visible.map((r) => {
                const cat = categoryById.get(r.categoryId);
                const acct = accountById.get(r.accountId);

                return (
                  <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                    {/* Transaction date */}
                    <span className="w-24 shrink-0 text-sm tabular-nums text-[#7A8580]">{r.date}</span>

                    {/* Transaction name, account, and description */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[#3F4A45]">{r.label || "Unlabeled"}</p>
                      <p className="truncate text-xs text-[#7A8580]">
                        {acct?.name ?? `Account ${r.accountId}`}
                        {r.description && ` · ${r.description}`}
                      </p>
                    </div>

                    {/* Transaction category */}
                    <span
                      className="hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs sm:inline-flex"
                      style={{ backgroundColor: (cat?.color ?? "#95A5A6") + "22", color: cat?.color ?? "#95A5A6" }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat?.color ?? "#95A5A6" }} />
                      {cat?.name ?? "Other"}
                    </span>

                    {/* Transaction amount, green for income and red for expense */}
                    <span
                      className={`w-28 shrink-0 text-right font-medium tabular-nums ${
                        r.amount >= 0 ? "text-[#3E8E5A]" : "text-[#B5574B]"
                      }`}
                    >
                      {r.amount >= 0 ? "+" : ""}
                      {formatMoney(r.amount, acct?.currency ?? "USD")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Test backend connection, only show during development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#7A8580]">
            <button
              onClick={async () => setBackendStatus(await checkBackendConnection())}
              className="rounded-md border border-[#CFE0CF] bg-white px-2 py-1"
            >
              Test backend connection
            </button>
            {backendStatus && <span>{backendStatus}</span>}
          </div>
        )}
      </div>

      {/* Show the form when Add transaction is clicked */}
      {showForm && (
        <AddTransactionForm
          onClose={() => setShowForm(false)}
          onCreated={(row) => {
            setRows((prev) => [row, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </main>
  );
}

//Form for adding a new transaction
function AddTransactionForm({ onClose, onCreated }: { onClose: () => void; onCreated: (row: Row) => void }) {
  //Store the information entered in the form
  const [date, setDate] = useState(today());
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[categories.length - 1].id); //Default to Other
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  //Save the transaction when the form is submitted
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); //Stop the form from reloading the page
    setError("");

    //Check if the amount is valid
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    //Use negative amount for expense and positive for income
    const signed = (kind === "expense" ? -value : value).toFixed(2);

    //Create the transaction data to send
    const body = { date, amount: signed, label, description, categoryId, accountId };

    //Add a transaction using mock data
    if (USE_MOCK) {
      onCreated({ id: Date.now(), ...body, amount: Number(signed) });
      return;
    }

    //Send the new transaction to the backend
    setSaving(true);
    try {
      const created = await apiFetch<BackendTransaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(body),
      });
      onCreated(fromBackend(created));
    } catch (e) {
      //Show an error if the transaction cannot be saved
      setError(e instanceof ApiRequestError ? e.message : "Could not save the transaction.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/20 px-4" onClick={onClose}>
      {/* Add transaction form */}
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-2xl border border-[#EDE6D3] bg-[#FFFDF7] p-6 shadow-lg"
      >
        {/* Form title and close button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#3F4A45]">Add transaction</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#7A8580]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Choose expense or income */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#EEF5EC] p-1 text-sm">
          {(["expense", "income"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-md py-1.5 capitalize ${kind === k ? "bg-white font-medium text-[#3F5747] shadow-sm" : "text-[#7A8580]"}`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Date and amount inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className="text-sm text-[#4F6657]">Date</label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e)=>setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="amount" className="text-sm text-[#4F6657]">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e)=>setAmount(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Transaction label */}
        <div>
          <label htmlFor="label" className="text-sm text-[#4F6657]">Label</label>
          <input
            id="label"
            maxLength={255}
            placeholder="e.g. Walmart"
            value={label}
            onChange={(e)=>setLabel(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Optional transaction description */}
        <div>
          <label htmlFor="description" className="text-sm text-[#4F6657]">Description (optional)</label>
          <textarea
            id="description"
            maxLength={4095}
            rows={2}
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Choose category and account */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="category" className="text-sm text-[#4F6657]">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e)=>setCategoryId(Number(e.target.value))}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="account" className="text-sm text-[#4F6657]">Account</label>
            <select
              id="account"
              value={accountId}
              onChange={(e)=>setAccountId(Number(e.target.value))}
              className={inputClass}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Show an error if saving fails */}
        {error && <p className="text-sm text-[#B5574B]">{error}</p>}

        {/* Save transaction button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] px-4 py-3 font-medium text-[#3F5747] transition hover:bg-[#E4EFE3] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save transaction"}
        </button>
      </form>
    </div>
  );
}
