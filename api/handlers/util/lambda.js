const Database = require("../../connections/db");
const Redis = require("../../connections/redis");
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


const handle = async (name, handler, module) => {
    module.exports[name] = async (event, context) => await exceptionHandler(event, context, handler);
};

const exceptionHandler = async (event, context, handle) => {
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        return await handle(event, context)
    } catch (ex) {
        console.log(ex);
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': JSON.stringify(ex)
        }
    } finally {
       exitHandler();
    }
};

function exitHandler() {
    try {
        console.log("Exiting process. Clearing Redis and Database connections.");
        //Database.cleanup();
        //Redis.cleanup();
    } catch (e) {
        console.log(e);
    }
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);

module.exports = {
    ok,
    handle,
    response
};