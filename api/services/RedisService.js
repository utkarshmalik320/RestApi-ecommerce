/* eslint-disable no-console */
const Redis = require('redis');

const redisClient = Redis.createClient({
  url: sails.config.custom.redisUrl,
});

redisClient.connect().then((err) => {
  if (!err) {
    sails.log.info('Redis Connected');
  } else {
    sails.log.error('Redis error:', err);
  }
});

module.exports = {

  /**
   * Insert data in redis
   */

  setData: async (key, value, time) => {
    try {
      await redisClient.set(key, JSON.stringify(value));
      if (time) {
        await redisClient.expire(key, time);
      }

    } catch (exception) {
      sails.log.error(exception);
    }
  },

  /**
   * Fetch data from redis
   */

  getData: async (key) => {
    const result = await redisClient.get(key);
    if (result) {
      return JSON.parse(result);
    } else {
      throw 'Redis Key Not Found';
    }
  },

  /**
   * Remove redis data
   */

  removeData: (key) => {
    redisClient.del(key);
  },

  /**
   * Set holiday sale enabled in redis
   */

  setHolidaySaleEnabled: async (key, value) => {
    try {
      await redisClient.set(key, JSON.stringify(value));
    } catch (exception) {
      sails.log.error(exception);
    }
  },

  /**
   * Fetch holiday sale enabled from redis
   */

  isHolidaySaleEnabled: async (key) => {
    let result = await redisClient.get(key);
    if (result) {
      result = result === 'true';
      return result;
    } else {
      return false;
    }
  },

};
