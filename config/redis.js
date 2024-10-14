const redis = require('redis');

module.exports = {
  // This function will be called when the Sails app is lifted
  configure: function(sails) {
    sails.redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: 2, // Specify the Redis DB index
    });

    // Optional: Handle Redis connection events
    sails.redisClient.on('connect', () => {
      sails.log.info('Connected to Redis');
    });

    sails.redisClient.on('error', (err) => {
      sails.log.error('Redis error:', err);
    });
  }
};
