"use client";

import { FileUp } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { apiFetch, ApiRequestError } from "../../lib/api";

interface CsvImportResponse {
  imported: number;
  skipped: number;
  failed: number;
}

interface CsvButtonProps {
  accountId: number | null;
  onImported?: (accountId: number) => Promise<void>;
}

export default function CsvButton({ accountId, onImported }: CsvButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setError("");
    setMessage("");
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSelectedFileName("");
      setError("Choose a CSV file.");
      return;
    }

    setSelectedFileName(file.name);
    if (accountId === null) {
      setError("Choose an account from the account filter before importing.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", String(accountId));

    setUploading(true);
    try {
      const result = await apiFetch<CsvImportResponse>("/api/import", {
        method: "POST",
        body: formData,
      });
      setMessage(`Imported ${result.imported}; skipped ${result.skipped}; failed ${result.failed}.`);

      try {
        await onImported?.(accountId);
      } catch {
        setError("Import succeeded, but the transaction list could not be refreshed.");
      }
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Could not import the CSV file.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-lg border border-[#CFE0CF] bg-[#EEF5EC] px-4 py-2 font-medium text-[#3F5747] transition hover:bg-[#E4EFE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9C9B0]"
      >
        <FileUp className="h-4 w-4" />
        {uploading ? "Importing…" : "Choose CSV"}
      </button>
      {selectedFileName && (
        <p className="mt-2 text-sm text-[#7A8580]" aria-live="polite">
          Selected: {selectedFileName}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-[#B5574B]" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-2 text-sm text-[#3E8E5A]" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}