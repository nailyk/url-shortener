import { UrlMapping } from "@url-shortener/shared-types";

type UrlCardProps = {
  item: UrlMapping;
  onDelete?: (id: number) => void;
};

export default function UrlCard({ item, onDelete }: UrlCardProps) {
  return (
    <div key={item.id} className="url-card">
      <div className="url-section">
        <span className="url-label">Original:</span>
        <a
          href={item.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="url-link"
        >
          {item.originalUrl}
        </a>
      </div>

      <div className="url-section">
        <span className="url-label">Short URL:</span>
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="url-link url-short"
        >
          {item.shortUrl}
        </a>
      </div>

      {item.expiresAt && (
        <div className="url-section">
          <span className="url-label">Expires:</span>
          <span className="url-expiration">
            {new Date(item.expiresAt).toLocaleString()}
          </span>
        </div>
      )}

      {onDelete && (
        <button
          className="app-button"
          style={{ marginTop: "0.5rem", background: "#e53e3e" }}
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      )}
    </div>
  );
}
