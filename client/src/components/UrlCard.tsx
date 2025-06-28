import { UrlMapping } from "@url-shortener/shared-types";

type UrlCardProps = {
  item: UrlMapping;
  onDelete?: (id: number) => void;
};

export default function UrlCard({ item, onDelete }: UrlCardProps) {
  return (
    <div key={item.id} className="url-card">
      <div className="url-section">
        <span className="url-label">Original URL</span>
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
        <span className="url-label">Short URL</span>
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="url-link url-short"
        >
          {item.shortUrl}
        </a>
      </div>

      <div className="url-section">
        {item.expiresAt ? (
          <>
            <span className="url-label">Expires</span>
            <span className="url-expiration">
              {new Date(item.expiresAt).toLocaleString()}
            </span>
          </>
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
