const ok = (result) => {
    const res = (result === null || result === undefined) ? 204 : 200;
    const body = {
        'statusCode': res,
        'headers': {'Content-Type': 'application/json'},
        'body': JSON.stringify(result)
    };
    if(res === 204) {
        delete body.body;
    }
    return body;
};

const handle = async (name, handler, module) => {
    module.exports[name] = async (event, context) => await exceptionHandler(event, context, handler);
};

const exceptionHandler = async (event, context, handle) => {
    try {
        return await handle(event, context)
    } catch(ex) {
        console.log(ex);
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': JSON.stringify(ex)
        }
    }
};


module.exports = {
    ok,
    handle
};