"use client";
import { useEffect, useState } from "react";
import { Plus, X, Landmark, PiggyBank, CreditCard, Wallet } from "lucide-react";
import { apiFetch, ApiRequestError } from "../../../lib/api";
import type { AccountType } from "../../../types/api";

//Account data returned by GET /api/accounts and POST /api/accounts
interface BackendAccount {
  id: number;
  name: string;
  type: AccountType;
}

//The 4 account types the backend accepts
const ACCOUNT_TYPES: AccountType[] = ["checking", "savings", "credit", "cash"];

//Get the text shown for each account type
function getTypeName(type: AccountType) {
  if (type === "checking") {
    return "Checking";
  } else if (type === "savings") {
    return "Savings";
  } else if (type === "credit") {
    return "Credit card";
  } else {
    return "Cash";
  }
}

//Get the icon for each account type
function getTypeIcon(type: AccountType) {
  if (type === "checking") {
    return <Landmark className="h-5 w-5" />;
  } else if (type === "savings") {
    return <PiggyBank className="h-5 w-5" />;
  } else if (type === "credit") {
    return <CreditCard className="h-5 w-5" />;
  } else {
    return <Wallet className="h-5 w-5" />;
  }
}

//Get the icon colors for each account type
function getTypeColor(type: AccountType) {
  if (type === "checking") {
    return "bg-[#E3EDF1] text-[#4A6F82]"; //blue
  } else if (type === "savings") {
    return "bg-[#E4EFE3] text-[#3E8E5A]"; //green
  } else if (type === "credit") {
    return "bg-[#F6E7E4] text-[#B5574B]"; //red
  } else {
    return "bg-[#F6F0DC] text-[#9A7B2F]"; //yellow
  }
}

//Get the error message to show the user
function getErrorMessage(e: unknown, defaultText: string) {
  if (e instanceof ApiRequestError) {
    return e.message;
  }
  return defaultText;
}

//Shared style for the form inputs
const inputClass =
  "mt-1 w-full rounded-lg border border-[#CFE0CF] bg-white px-3 py-2 text-[#3F4A45] focus:outline-none focus:ring-2 focus:ring-[#A9C9B0]";

export default function AccountsPage() {
  //Store the list of accounts
  const [accounts, setAccounts] = useState<BackendAccount[]>([]);

  //Store loading and error states
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  //Store the add account form states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  //Load the user's accounts when the page opens
  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await apiFetch<BackendAccount[]>("/api/accounts");
        setAccounts(data);
        setLoadError("");
      } catch (e) {
        setLoadError(getErrorMessage(e, "Could not load accounts."));
      }
      setLoading(false);
    }
    loadAccounts();
  }, []);

  //Open the form and clear old values
  function openForm() {
    setName("");
    setType("checking");
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  }

  //Close the form
  function closeForm() {
    setShowForm(false);
    setFormError("");
  }

  //Save the new account when the form is submitted
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); //Stop the form from reloading the page
    setFormError("");

    //Check the account name
    const trimmedName = name.trim();
    if (trimmedName === "") {
      setFormError("Please enter an account name.");
      return;
    }
    if (trimmedName.length > 50) {
      setFormError("Account name must be 50 characters or less.");
      return;
    }

    //The backend requires settings, but does not use it yet, so send "{}"
    const body = {
      name: trimmedName,
      type: type,
      settings: "{}",
    };

    //Send the new account to the backend
    setSaving(true);
    try {
      const newAccount = await apiFetch<BackendAccount>("/api/accounts", {
        method: "POST",
        body: JSON.stringify(body),
      });

      //Add the new account to the end of the list
      const newList: BackendAccount[] = [];
      for (const account of accounts) {
        newList.push(account);
      }
      newList.push(newAccount);
      setAccounts(newList);

      //Close the form and show a success message
      setShowForm(false);
      setSuccessMessage('Added "' + newAccount.name + '".');
    } catch (e) {
      setFormError(getErrorMessage(e, "Could not save the account."));
    }
    setSaving(false);
  }

  //Decide which message to show in the list area
  let noAccounts = false;
  if (!loading && loadError === "" && accounts.length === 0) {
    noAccounts = true;
  }

  //Text on the save button
  let saveButtonText = "Save account";
  if (saving) {
    saveButtonText = "Saving…";
  }

  return (
    <main className="relative min-h-screen bg-linear-to-b from-[#E4EFE3] via-[#E3EDF1] via-40% to-[#FBF8EF] to-75% px-4 py-8 md:px-10">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#9BB5A3_1px,transparent_1px),linear-gradient(90deg,#9BB5A3_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative mx-auto max-w-5xl">
        {/* Page title and add button */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#3F5747]">Accounts</h1>
            <p className="mt-1 text-sm text-[#7A8580]">Where your money is kept.</p>
          </div>

          <button
            onClick={openForm}
            disabled={loading || loadError !== ""}
            className="flex items-center gap-2 rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] px-4 py-2 font-medium text-[#3F5747] transition hover:-translate-y-0.5 hover:bg-[#E4EFE3] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Plus className="h-4 w-4" /> Add account
          </button>
        </div>

        {/* Success message after adding an account */}
        {successMessage !== "" && (
          <p className="mt-4 text-sm text-[#3E8E5A]">{successMessage}</p>
        )}

        {/* Show loading or error message */}
        {loading && <p className="mt-6 text-sm text-[#7A8580]">Loading…</p>}
        {loadError !== "" && (
          <div className="mt-6 rounded-2xl border border-[#EDE6D3] bg-[#FFFDF7] p-6 text-sm text-[#B5574B] shadow-sm">
            {loadError}
          </div>
        )}

        {/* Show this when the user has no accounts yet */}
        {noAccounts && (
          <div className="mt-6 rounded-2xl border border-[#EDE6D3] bg-[#FFFDF7] p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-[#3F4A45]">Create your first account</p>
            <p className="mt-1 text-sm text-[#7A8580]">
              Add a checking, savings, credit card, or cash account to start tracking transactions.
            </p>
            <button
              onClick={openForm}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] px-4 py-2 font-medium text-[#3F5747] transition hover:bg-[#E4EFE3]"
            >
              <Plus className="h-4 w-4" /> Add account
            </button>
          </div>
        )}

        {/* List of accounts */}
        {accounts.length > 0 && (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex items-center gap-4 rounded-2xl border border-[#EDE6D3] bg-[#FFFDF7] p-5 shadow-sm"
              >
                {/* Icon for the account type */}
                <div className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-full " + getTypeColor(account.type)}>
                  {getTypeIcon(account.type)}
                </div>

                {/* Account name and type */}
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#3F4A45]">{account.name}</p>
                  <p className="text-sm text-[#7A8580]">{getTypeName(account.type)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add account form, shown when the button is clicked */}
      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/20 px-4" onClick={closeForm}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-2xl border border-[#EDE6D3] bg-[#FFFDF7] p-6 shadow-lg"
          >
            {/* Form title and close button */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#3F4A45]">Add account</h2>
              <button type="button" onClick={closeForm} aria-label="Close" className="text-[#7A8580]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Account name input */}
            <div>
              <label htmlFor="name" className="text-sm text-[#4F6657]">Name</label>
              <input
                id="name"
                required
                maxLength={50}
                placeholder="e.g. Main Checking"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Account type dropdown */}
            <div>
              <label htmlFor="type" className="text-sm text-[#4F6657]">Type</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className={inputClass}
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>{getTypeName(t)}</option>
                ))}
              </select>
            </div>

            {/* Show an error if saving fails */}
            {formError !== "" && <p className="text-sm text-[#B5574B]">{formError}</p>}

            {/* Save account button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] px-4 py-3 font-medium text-[#3F5747] transition hover:bg-[#E4EFE3] disabled:opacity-60"
            >
              {saveButtonText}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}