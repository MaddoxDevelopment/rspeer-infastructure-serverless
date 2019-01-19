const Redis = require("../connections/redis");

const upsertConnectedClient = async (clientId, userId) => {
    await Redis.set(`connected-client-${userId}-${clientId}`, {
        clientId
    }, 60);
};

const disconnectClient = async (clientId, userId) => {
    await Redis.remove(`connected-client-${userId}-${clientId}`);
};

const getCount = async (userId) => {
    const redis = await Redis.getInstance();
    if(!redis) {
        //If we can't contact redis, just return 0 so we do not stop people from using the service.
        return 0;
    }
    return new Promise((res) => {
        let count = 0;
        const stream = redis.scanStream({
            match: `connected-client-${userId}-*`
        });
        stream.on('data', (keys) => {
            count = keys.length;
        });
        stream.on('end', () => {
           res(count);
        });
    });
};

const ConnectedClientService = {
    upsertConnectedClient,
    getCount,
    disconnectClient
};

module.exports = ConnectedClientService;