const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// client.connect(); 

(async () => {
  await client.connect();
})();

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.on('Connect', () => console.log("Connected"))

module.exports = client;