import { UrlMapping } from "@url-shortener/shared-types";
import UrlCard from "./UrlCard";

type UrlListProps = {
  items: UrlMapping[];
  loading: boolean;
  onDelete?: (id: number) => void;
};

export default function UrlList({ items, loading, onDelete }: UrlListProps) {
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  if (items.length === 0) {
    return <p style={{ textAlign: "center" }}>No URLs found.</p>;
  }

  return (
    <div className="app-url-list">
      {items.map((item) => (
        <UrlCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}
