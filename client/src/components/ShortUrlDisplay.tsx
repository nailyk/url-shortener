type ShortUrlDisplayProps = {
  shortUrl: string;
};

export default function ShortUrlDisplay({ shortUrl }: ShortUrlDisplayProps) {
  return (
    <div className="app-shorturl">
      <span>Short URL:</span>
      <br />
      <a
        href={shortUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="app-shorturl-link"
        id="shortUrl"
      >
        {shortUrl}
      </a>
    </div>
  );
}
