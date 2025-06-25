import { FormEvent } from "react";

type ShortenUrlFormProps = {
  url: string;
  customAlias: string;
  expiresIn: string;
  onChangeUrl: (v: string) => void;
  onChangeAlias: (v: string) => void;
  onChangeExpires: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export default function ShortenUrlForm({
  url,
  customAlias,
  expiresIn,
  onChangeUrl,
  onChangeAlias,
  onChangeExpires,
  onSubmit,
}: ShortenUrlFormProps) {
  return (
    <form onSubmit={onSubmit} className="app-form">
      <div>
        <label className="app-label">Original URL:</label>
        <input
          type="url"
          name="url"
          value={url}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder="https://example.com"
          className="app-input"
          required
        />
      </div>
      <div>
        <label className="app-label">Custom Alias (optional):</label>
        <input
          type="text"
          name="customAlias"
          value={customAlias}
          onChange={(e) => onChangeAlias(e.target.value)}
          placeholder="myalias"
          className="app-input"
          maxLength={20}
        />
      </div>
      <div>
        <label className="app-label">Expires In (e.g. 5m, 2h):</label>
        <input
          type="text"
          name="expiresIn"
          value={expiresIn}
          onChange={(e) => onChangeExpires(e.target.value)}
          placeholder="5m"
          className="app-input"
        />
      </div>
      <button type="submit" className="app-button">
        Shorten URL
      </button>
    </form>
  );
}
