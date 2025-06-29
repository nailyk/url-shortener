import { FormEvent, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import "./App.css";

import {
  ApiErrorResponseBody,
  ApiValidationErrorResponseBody,
  CreateUrlMappingSuccessResponseBody,
  GetAllUrlMappingsResponseBody,
  UrlMapping,
} from "@url-shortener/shared-types";

import ConfirmationModal from "./components/ConfirmationModal";
import ErrorMessage from "./components/ErrorMessage";
import ShortenUrlForm from "./components/ShortenUrlForm";
import ShortUrlDisplay from "./components/ShortUrlDisplay";
import Tabs from "./components/Tabs";
import UrlList from "./components/UrlList";

export default function App() {
  const [tab, setTab] = useState<"create" | "list">("create");

  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [urlMappings, setUrlMappings] = useState<UrlMapping[]>([]);
  const [loadingUrlMappings, setLoadingUrlMappings] = useState(false);

  const fetchUrlMappings = async (): Promise<void> => {
    setLoadingUrlMappings(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/urls`);
      const data: GetAllUrlMappingsResponseBody | ApiErrorResponseBody =
        await res.json();

      if (!res.ok) {
        const errorText =
          (data as ApiErrorResponseBody).error || "Error fetching URLs";
        throw new Error(errorText);
      }

      setUrlMappings(data as UrlMapping[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoadingUrlMappings(false);
    }
  };

  useEffect(() => {
    if (tab === "list") {
      fetchUrlMappings();
    } else {
      setShortUrl("");
      setError("");
    }
  }, [tab]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setShortUrl("");

    const payload: { url: string; customAlias?: string; expiresIn?: string } = {
      url,
    };
    if (customAlias) payload.customAlias = customAlias;
    if (expiresIn) payload.expiresIn = expiresIn;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data:
        | CreateUrlMappingSuccessResponseBody
        | ApiErrorResponseBody
        | ApiValidationErrorResponseBody = await res.json();

      if (!res.ok) {
        if ("errors" in data) {
          setError(data.errors.map((e) => e.msg).join(", "));
        } else {
          setError((data as ApiErrorResponseBody).error || "Unknown error");
        }
      } else {
        setShortUrl((data as CreateUrlMappingSuccessResponseBody).shortUrl);
        setUrl("");
        setCustomAlias("");
        setExpiresIn("");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setShowConfirm(false);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/urls/${pendingDeleteId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete URL");
      }
      setUrlMappings((urls) => urls.filter((u) => u.id !== pendingDeleteId));
      toast.success("URL mapping deleted!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete URL mapping",
      );
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <ConfirmationModal
        open={showConfirm}
        message="Are you sure you want to delete this URL mapping?"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
      <div className="app-container">
        <h1 className="app-title">🔗 URL Shortener</h1>

        {/* Use your Tabs component */}
        <Tabs currentTab={tab} onChange={setTab} />

        {tab === "create" && (
          <>
            <ShortenUrlForm
              url={url}
              customAlias={customAlias}
              expiresIn={expiresIn}
              onChangeUrl={setUrl}
              onChangeAlias={setCustomAlias}
              onChangeExpires={setExpiresIn}
              onSubmit={handleSubmit}
            />
            <ErrorMessage message={error} />
            {shortUrl && <ShortUrlDisplay shortUrl={shortUrl} />}
          </>
        )}

        {tab === "list" && (
          <UrlList
            items={urlMappings}
            loading={loadingUrlMappings}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  );
}
