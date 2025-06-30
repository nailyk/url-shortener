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
        <label className="app-label" htmlFor="url">
          Original URL <span className="required">*</span>
        </label>
        <input
          id="url"
          type="url"
          name="url"
          value={url}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder="https://github.com/your-very-long-url"
          className="app-input"
          required
          aria-required="true"
          autoComplete="off"
        />
      </div>
      <div>
        <label className="app-label" htmlFor="customAlias">
          Custom Alias <span className="optional">(optional)</span>
        </label>
        <input
          id="customAlias"
          type="text"
          name="customAlias"
          value={customAlias}
          onChange={(e) => onChangeAlias(e.target.value)}
          placeholder="dev-link"
          className="app-input"
          maxLength={20}
          aria-required="false"
          autoComplete="off"
        />
      </div>
      <div>
        <label className="app-label" htmlFor="expiresIn">
          Expires In <span className="optional">(optional)</span>
        </label>
        <input
          id="expiresIn"
          type="text"
          name="expiresIn"
          value={expiresIn}
          onChange={(e) => onChangeExpires(e.target.value)}
          placeholder="7 days (7d), 1 hour (1h), etc."
          className="app-input"
          aria-required="false"
          autoComplete="off"
        />
      </div>
      <button type="submit" className="app-button">
        Create Short Link
      </button>
    </form>
  );
}
