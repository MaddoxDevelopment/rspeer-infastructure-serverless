const Dynamo = require("../../connections/dynamo");
const Redis = require("../../connections/redis");
const assert = require('chai').assert;
const addMinutes = require('date-fns/add_minutes');
const format = require('date-fns/format');
const ScriptService = require("./scriptService");
const table = "ScriptAccess";

const key = (scriptId, userId) => `script-access-${userId}-${scriptId}`;
const setKey = (userId) => `script-access-set-${userId}`;

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
    Redis.set(key(scriptId, userId), total);
    Redis.setAdd(setKey(userId), scriptId);
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

const getScripts = async (userId) => {
    const key = setKey(userId);
    let ids = await Redis.hashSetGetAndSet(setKey(userId));
    if(ids == null || ids.length === 0) {
        const result = await Dynamo.getByAttribute(table, 'UserId', userId);
        ids = result.items.map(i => i.ScriptId);
        Redis.setAdd(key, ids.length === 0 ? 'no-current-scripts' : ids);
    }
    ids = ids.filter(i => i !== 'no-current-scripts');
    const scripts = await Promise.all(ids.map(i => ScriptService.getScript(i)));
    return scripts.filter(s => s != null);
};

const ScriptAccessService = {
    addAccess,
    getAccess,
    getScripts
};

module.exports = ScriptAccessService;