import { useState } from "react";
import "./app.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");
    try {
      const payload = { url };
      if (customAlias) payload.customAlias = customAlias;
      if (expiresIn) payload.expiresIn = expiresIn;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.errors?.map((e) => e.msg).join(", "));
      } else {
        setShortUrl(data.shortUrl);
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">🔗 URL Shortener</h1>
      <form onSubmit={handleSubmit} className="app-form">
        <div>
          <label className="app-label">Original URL:</label>
          <br />
          <input
            type="url"
            value={url}
            name="url"
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="app-input"
            required
          />
        </div>
        <div>
          <label className="app-label">Custom Alias (optional):</label>
          <br />
          <input
            type="text"
            value={customAlias}
            name="customAlias"
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="myalias"
            className="app-input"
            maxLength={20}
          />
        </div>
        <div>
          <label className="app-label">
            Expires In (optional, e.g. 5m, 2h):
          </label>
          <br />
          <input
            type="text"
            value={expiresIn}
            name="expiresIn"
            onChange={(e) => setExpiresIn(e.target.value)}
            placeholder="5m"
            className="app-input"
          />
        </div>
        <button type="submit" className="app-button">
          Shorten URL
        </button>
      </form>
      {error && <p className="app-error">{error}</p>}
      {shortUrl && (
        <div className="app-shorturl">
          <span style={{ color: "#38a169", fontWeight: 500 }}>Short URL:</span>
          <br />
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="app-shorturl-link"
            name="shortUrl"
          >
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
}
