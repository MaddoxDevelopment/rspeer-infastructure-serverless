const redis = require("redis");
const client = redis.createClient({
    host : process.env.redis_host,
    password : process.env.redis_password
});

const promiseGet = (key) => {
    return new Promise(resolve => {
        client.get(key, function (err, res) {
            resolve(err ? null : res);
        })
    })
};

const Redis = {
    get : async (key, fallback) => {
        const value = await promiseGet(key);
        if(!value) {
            return fallback ? await fallback() : null;
        }
        return JSON.parse(value);
    },
    getAndSet : async (key, fallback, expiration = 86400) => {
        const value = await promiseGet(key);
        if(!value) {
            const result = await fallback();
            if(result) {
                client.set(key, JSON.stringify(result), 'EX', expiration);
            }
            return result;
        }
        return JSON.parse(value);
    },
    remove : (key) => {
        client.del(key);
    },
    set : async (key, value) => await client.set(key, JSON.stringify(value))
};

module.exports = Redis;