export default function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;

  return <p className="app-error">{message}</p>;
}
