const Dynamo = require("../../connections/dynamo");
const Redis = require("../../connections/redis");
const assert = require('chai').assert;
const addMinutes = require('date-fns/add_minutes');
const format = require('date-fns/format');
const table = "ScriptAccess";

const key = (scriptId, userId) => `script-access-${userId}-${scriptId}`;

const addAccess = async (scriptId, userId) => {
    assert.exists(scriptId);
    assert.exists(userId);
    const access = await getAccess(scriptId, userId);
    const now = Date.now();
    const expiration = format(addMinutes(now, 1), 'x');
    const total = access.concat([expiration]);
    await Dynamo.put(table, {
        UserId : userId,
        ScriptId : scriptId,
        Expiration : total
    });
    Redis.set(key(scriptId, userId), total, 86400);
    return total;
};

const getAccess = async (scriptId, userId) => {
    return await Redis.getAndSet(key(scriptId, userId), async () => {
        const now = Date.now();
        const result = await Dynamo.get({
            TableName: table,
            Key: {
                UserId: userId,
                ScriptId: scriptId
            }
        });
        let existing = result.Item != null ? result.Item.Expiration : [];
        return existing.filter(date => date > now);       
    });
};

const ScriptAccessService = {
    addAccess,
    getAccess
};

module.exports = ScriptAccessService;