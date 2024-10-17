const redis = require('redis');
const client = redis.createClient();

// client.connect(); 

(async () => {
  await client.connect();
})();

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.on('Connect', () => console.log("Connected"))

module.exports = client;