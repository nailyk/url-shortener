import { ShortenedUrlEntry } from "@url-shortener/shared-types";
import UrlCard from "./UrlCard";

type UrlListProps = {
  items: ShortenedUrlEntry[];
  loading: boolean;
};

export default function UrlList({ items, loading }: UrlListProps) {
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  if (items.length === 0) {
    return <p style={{ textAlign: "center" }}>No URLs found.</p>;
  }

  return (
    <div className="app-url-list">
      {items.map((item) => (
        <UrlCard key={item.id} item={item} />
      ))}
    </div>
  );
}
