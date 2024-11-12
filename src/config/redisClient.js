const redis = require(process.env.NODE_ENV === 'test' ? 'redis-mock' : 'redis');

let client;

if (process.env.NODE_ENV === 'test') {
  client = redis.createClient();
}
else {
  //  If in production use redis url provided by heroku's redis service
  const redisOptions = process.env.REDIS_URL 
    ? 
      { url: process.env.REDIS_URL }
    :
      {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }

  client = redis.createClient(redisOptions);

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  client.on('connect', () => console.log("Connected"))

}

// Call connect if the method exists (for Redis v4 clients)
if (typeof client.connect === 'function') {
  (async () => {
    await client.connect();
  })();
}

module.exports = client;