const db = require('./../../db');
const assert = require('chai').assert;

const addAccess = async (scriptId, userId) => {
    assert.exists(scriptId);
    assert.exists(userId);
    const expiration = new Date(Date.now());
    expiration.setUTCMonth(expiration.getUTCMonth() + 1);
    const insert = await db.query(
            `INSERT INTO public.script_access(userid, scriptid, dateadded, expirationdate)
             VALUES ($1, $2, current_timestamp, to_timestamp($3)) RETURNING *`,
        [userId, scriptId, expiration.getTime() / 1000]);
    return insert.rows[0]
};

const removeAllAccess = async (scriptId, userId) => {
    assert.exists(scriptId);
    assert.exists(userId);
    await db.query(`DELETE
                    FROM public.script_access
                    WHERE scriptid = $1
                      AND userid = $2`,
        [scriptId, userId]);
};

const removeAccess = async (accessId) => {
    assert.exists(accessId);
    await db.query(`DELETE
                    FROM public.script_access
                    WHERE id = $1`, [accessId]);
};

const getAccess = async (userId) => {
    const query = `SELECT name, description, scriptId, expirationdate, contentid, a.id as accessId
                   FROM script_access a
                          INNER JOIN scripts s ON s.id = a.scriptid
                   WHERE a.expirationdate > current_timestamp
                     AND a.userid = $1`;
    const results = await db.query(query, [userId]);
    return results.rows;
};

const ScriptAccessService = {
    addAccess,
    getAccess,
    removeAccess,
    removeAllAccess
};

module.exports = ScriptAccessService;