<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/76dc7b1f-88fc-4bb6-92c1-4eecc9614663

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your `GEMINI_API_KEY`
3. Start the Gemini proxy (keeps the key on the server):
   `npm run proxy`
4. In another terminal, run the app:
   `npm run dev`

## Deploy to a VPS

See [DEPLOY.md](DEPLOY.md).
