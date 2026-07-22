# Deployment

## GitHub

Remote is already configured:

```bash
git remote -v
```

Expected remote:

```text
https://github.com/Lucastepp/white-bloom-media.git
```

If GitHub says `Repository not found`, create an empty repository named `white-bloom-media` under the `Lucastepp` account, then push:

```bash
git push -u origin main
```

Do not initialize the GitHub repo with a README, `.gitignore` or license because the local project already has commits.

## Vercel

1. In Vercel, choose `Add New...` then `Project`.
2. Import `Lucastepp/white-bloom-media`.
3. Use these settings:
   - Framework Preset: `Other`
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `dist/white-bloom-media/browser`
4. Deploy.

The project has `vercel.json` with the same build output and SPA rewrite configuration.

## Meta Conversions API

Add the CAPI token in Vercel before relying on server-side Meta events:

```bash
vercel env add META_CAPI_ACCESS_TOKEN production
```

Optional test events variable:

```bash
vercel env add META_TEST_EVENT_CODE production
```

## Before Launch

- Add the final production domain in Vercel.
- Production domain: `https://whitebloom.media`.
- Connect the real contact method before enabling the form.
- Replace coming-soon content blocks when real event videos are ready.
