// 1. Check if we are explicitly in production
const isProduction = import.meta.env?.PROD || process.env.NODE_ENV === 'production';

// 2. Set the Base URL
export const API_BASE_URL = isProduction
  ? 'https://reaves-f-mol1-3isvuqyw6-galarjs-projects.vercel.app'
  : 'http://localhost:3000';

// 3. Log it once so you can see it in the Chrome DevTools console
console.log(`[REAVES] Current API Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`[REAVES] Target URL: ${API_BASE_URL}`);