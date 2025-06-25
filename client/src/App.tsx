import { useEffect, useState, FormEvent } from "react";
import "./App.css";

import {
  GetAllUrlsResponseBody,
  ShortenedUrlEntry,
  ShortenUrlSuccessResponseBody,
  ApiErrorResponseBody,
  ApiValidationErrorResponseBody,
} from "@url-shortener/shared-types";

import ShortenUrlForm from "./components/ShortenUrlForm";
import ShortUrlDisplay from "./components/ShortUrlDisplay";
import UrlList from "./components/UrlList";
import ErrorMessage from "./components/ErrorMessage";
import Tabs from "./components/Tabs";

export default function App() {
  const [tab, setTab] = useState<"create" | "list">("create");

  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const [shortUrls, setShortUrls] = useState<ShortenedUrlEntry[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);

  const fetchShortUrls = async (): Promise<void> => {
    setLoadingUrls(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/urls`);
      const data: GetAllUrlsResponseBody | ApiErrorResponseBody =
        await res.json();

      if (!res.ok) {
        const errorText =
          (data as ApiErrorResponseBody).error || "Error fetching URLs";
        throw new Error(errorText);
      }

      setShortUrls(data as ShortenedUrlEntry[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoadingUrls(false);
    }
  };

  useEffect(() => {
    if (tab === "list") {
      fetchShortUrls();
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
        | ShortenUrlSuccessResponseBody
        | ApiErrorResponseBody
        | ApiValidationErrorResponseBody = await res.json();

      if (!res.ok) {
        if ("errors" in data) {
          setError(data.errors.map((e) => e.msg).join(", "));
        } else {
          setError((data as ApiErrorResponseBody).error || "Unknown error");
        }
      } else {
        setShortUrl((data as ShortenUrlSuccessResponseBody).shortUrl);
        setUrl("");
        setCustomAlias("");
        setExpiresIn("");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
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

      {tab === "list" && <UrlList items={shortUrls} loading={loadingUrls} />}
    </div>
  );
}
