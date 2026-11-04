// Local development server. On Vercel, api/index.js is used instead.
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SPARK X API running on http://localhost:${PORT}`);
});
