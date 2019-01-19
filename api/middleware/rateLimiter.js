const Redis = require('./../connections/redis');

const RateLimiter = {
    increment: async (userId, action, expiration = 180) => {
        const key = `rate-limit-${userId}-${action}`;
        const value = await Redis.increment(key);
        if (value <= 1) {
            Redis.expire(key, expiration);
        }
    },
    atLimit: async (userId, action, limit) => {
        const key = `rate-limit-${userId}-${action}`;
        const value = await Redis.get(key);
        return value && value >= limit;
    }
};

module.exports = RateLimiter;