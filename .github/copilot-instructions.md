# Pocket expense dashboard

- Use Next.js App Router, TypeScript, Tailwind CSS, Recharts, and Lucide.
- Keep Notion secrets in environment variables and all Notion calls server-side.
- Keep transaction, category, currency, mock, and Notion mapping logic in `src/lib` or `src/types`.
- Preserve demo mode unless both `NOTION_API_KEY` and `NOTION_DATABASE_ID` are configured.
- Validate before committing with `npm run lint` and `npm run build`.
