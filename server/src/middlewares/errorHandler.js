export default function (err, req, res, next) {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
