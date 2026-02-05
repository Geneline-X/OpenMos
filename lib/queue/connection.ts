import IORedis, { type RedisOptions } from "ioredis";

// Redis connection for BullMQ
// In production, use a proper Redis URL with password
// Format: redis://:<password>@host:port or redis://default:<password>@host:port
const redisUrl = process.env.REDIS_URL;
const redisPassword = process.env.REDIS_PASSWORD;

// Parse connection options
function getRedisOptions(): RedisOptions {
  const options: RedisOptions = {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
  };

  // If password is provided separately, add it
  if (redisPassword) {
    options.password = redisPassword;
  }

  // If we have a full URL, parse it
  if (redisUrl) {
    // Check if URL already has the redis:// prefix
    if (redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://")) {
      // URL format - parse it
      try {
        const url = new URL(redisUrl);
        options.host = url.hostname;
        options.port = parseInt(url.port) || 6379;
        if (url.password) {
          options.password = url.password;
        }
        if (url.protocol === "rediss:") {
          options.tls = {};
        }
      } catch {
        // If URL parsing fails, try as host:port
        const [host, port] = redisUrl.split(":");
        options.host = host;
        options.port = parseInt(port) || 6379;
      }
    } else {
      // Just host:port format
      const [host, port] = redisUrl.split(":");
      options.host = host;
      options.port = parseInt(port) || 6379;
    }
  } else {
    // Default to localhost
    options.host = "localhost";
    options.port = 6379;
  }

  return options;
}

const redisOptions = getRedisOptions();

export const connection = new IORedis(redisOptions);

// Create a new connection for each worker (BullMQ best practice)
export function createConnection() {
  return new IORedis(redisOptions);
}
