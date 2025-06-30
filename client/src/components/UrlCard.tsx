import { UrlMapping } from "@url-shortener/shared-types";
import { useEffect, useState } from "react";

type UrlCardProps = {
  item: UrlMapping;
  onDelete?: (id: number) => void;
};

export default function UrlCard({ item, onDelete }: UrlCardProps) {
  const [now, setNow] = useState(Date.now());

  const expiresAtTime = item.expiresAt
    ? new Date(item.expiresAt).getTime()
    : null;
  const isExpired = expiresAtTime !== null ? expiresAtTime < now : false;

  useEffect(() => {
    if (expiresAtTime === null || isExpired) return;
    const delay = expiresAtTime - Date.now();
    const timeout = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(timeout);
  }, [expiresAtTime, isExpired]);

  return (
    <div
      key={item.id}
      className={`url-card${isExpired ? " url-card-expired" : ""}`}
      aria-disabled={isExpired}
    >
      <div className="url-section">
        <span className="url-label">Short URL</span>
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`url-link url-short${isExpired ? " url-link-expired" : ""}`}
          tabIndex={isExpired ? -1 : 0}
          aria-disabled={isExpired}
        >
          {item.shortUrl}
        </a>
      </div>

      <div className="url-section">
        <span className="url-label">Original URL</span>
        <a
          href={item.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`url-link${isExpired ? " url-link-expired" : ""}`}
          tabIndex={isExpired ? -1 : 0}
          aria-disabled={isExpired}
        >
          {item.originalUrl}
        </a>
      </div>

      <div className="url-section">
        {item.expiresAt ? (
          isExpired ? (
            <>
              <span className="url-expiration url-expiration-expired">
                Expired
              </span>
            </>
          ) : (
            <>
              <span className="url-label">Expires</span>
              <span className="url-expiration">
                {new Date(item.expiresAt).toLocaleString()}
              </span>
            </>
          )
        ) : (
          <span className="url-expiration url-expiration-permanent">
            No expiration
          </span>
        )}
      </div>
      <div className="url-card-actions">
        {onDelete && (
          <button
            className="app-button app-button-delete"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
