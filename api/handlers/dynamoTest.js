const Dynamo = require("../connections/dynamo");
const {ok, handle} = require("./util/lambda");
const addMinutes = require('date-fns/add_minutes');
const format = require('date-fns/format');

handle('dynamo', async (event, context) => {
    const now = Date.now();
    const expiration = format(addMinutes(now, 1), 'x');
    const result = await Dynamo.get({
        TableName: 'ScriptAccess',
        Key: {
            UserId: '9eab5f28-62d4-4e18-b1f1-6f8dfb5c10fa',
            ScriptId: 'abcd6665-e066-43b8-8010-ab38d70d0f14'
        }
    });
    let existing = result.Item != null ? result.Item.Expiration : [];
    existing = existing.filter(date => date > now);
    const query = await Dynamo.put('ScriptAccess', {
        UserId : '9eab5f28-62d4-4e18-b1f1-6f8dfb5c10fa',
        ScriptId : 'abcd6665-e066-43b8-8010-ab38d70d0f14',
        Expiration : existing.concat([expiration])
    });
    return ok(query);
}, module);