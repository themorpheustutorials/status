export {};

declare global {
  const TELEGRAM_TOKEN: string;
  const TELEGRAM_CHAT_IDS: string;
  const DISCORD_WEBHOOKS: string;
  const SENTRY_DSN: string;
  const STATUS: KVNamespace;
}
