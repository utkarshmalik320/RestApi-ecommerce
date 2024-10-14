/**
 * Local environment settings
 *
 * Use this file to specify configuration settings for use while developing
 * the app on your personal system.
 *
 * For more information, check out:
 * https://sailsjs.com/docs/concepts/configuration/the-local-js-file
 */

module.exports.redis = {
  host: 'localhost', // Redis server hostname
  port: 6379,        // Redis server port (default is 6379)
  password: 'your_password', // Redis server password (only if authentication is required)
  db: 0,             // Redis database index to use
};
