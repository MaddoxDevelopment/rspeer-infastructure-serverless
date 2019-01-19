const Redis = require("../../connections/redis");
const RateLimiter = require("./../../middleware/rateLimiter");
const UserService = require("../../services/userService");

const ok = (result) => {
    const status = (result === null || result === undefined) ? 204 : 200;
    return response(status, result);
};

const response = (statusCode, result) => {
    const res = (result === null || result === undefined) ? 204 : 200;
    const body = {
        'statusCode': statusCode,
        'headers': {'Content-Type': 'application/json'},
        'body': JSON.stringify(result)
    };
    if (res === 204) {
        delete body.body;
    }
    return body;
};


const handle = async ({name, rateAction, rateLimit, rateExpiration, module, handler}) => {
    module.exports[name] = async (event, context) => {
        if (rateAction) {
            const user = await UserService.getUserFromRequest(event, false);
            if (!user) {
                return response(400, {error: "You must be logged in."})
            }
            if (await checkRateLimit(user.userId, rateAction, rateLimit, rateExpiration)) {
                return response(429, {error: "Too many requests, please try again in a few minutes."})
            }
        }
        return await exceptionHandler(event, context, handler);
    }
};

const checkRateLimit = async (userId, action, limit, expiration) => {
    if (await RateLimiter.atLimit(userId, action, limit)) {
        return true;
    }
    RateLimiter.increment(userId, action, expiration || 180);
    return false;
};

const exceptionHandler = async (event, context, handle) => {
    try {
        return await handle(event, context)
    } catch (ex) {
        console.log(ex);
        return response(400, {error: ex})
    } finally {
        exitHandler();
    }
};

function exitHandler() {
    try {
        Redis.cleanup();
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    ok,
    handle,
    response
};