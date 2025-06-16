export const PORT = Number(process.env.PORT || 5000);
export const HOST = process.env.HOST || "0.0.0.0";
export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";
export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your_default_access_token_secret";
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_default_refresh_token_secret";
