# JobMatch MVP

Responsive React + Vite + Tailwind CSS v4 lead-generation website.

Brand: JobMatch
Tagline: Find the right jobs. Apply with confidence.

Run:
npm install
npm run dev

Configure the lead form before using it:

Create a `.env` file in the project root:

```env
VITE_FORM_SUBMISSION_MODE=email
VITE_JOBMATCH_EMAIL=you@example.com
```

For Google Forms, use `VITE_FORM_SUBMISSION_MODE=google` and provide `VITE_GOOGLE_FORM_URL`. The form will show an error instead of claiming success when no destination is configured.
