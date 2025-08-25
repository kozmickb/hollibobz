# Holiday Timers + Holly Bobz (Expo)

## Quickstart
1. Install deps
   ```bash
   bun install   # or npm install
   ```
2. Create `.env` in project root (if not present) and set:
   ```
   EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY=YOUR_KEY_HERE
   ```
3. Run
   ```bash
   npx expo start
   ```

## Features
- Timers with archive or delete
- Holly Bobz AI chat (budget modes + £ per person + seeded queries from timers)
- Local chat history via AsyncStorage

## Notes
- Client side API call is for demo only. Proxy via a small server for production.