const UserService = require("../services/userService");
const AuthService = require("../services/authService");
const ScriptAccessService = require("../services/script/scriptAccessService");
const ScriptService = require("../services/script/scriptService");
const {ok, handle} = require('./util/lambda');

/*
handle('getScript', async (event, context) => {
    const qs = event.queryStringParameters || {};
    return ok(!qs.id ? null : await ScriptService.getScript(qs.id));
}, module);

handle('createScript', async (event, context) => {
    await AuthService.assertOwner(event);
    return ok(await ScriptService.insert(JSON.parse(event.body)))
}, module);

handle('getScriptAccess', async (event, context) => {
    const user = await UserService.getUserFromRequest(event);
    return ok(await ScriptAccessService.getAccess(user.userId));
}, module);

handle('addScriptAccess', async (event, context) => {
    await AuthService.assertOwner(event);
    const body = JSON.parse(event.body);
    return ok(await ScriptAccessService.addAccess(body.scriptId, body.userId))
}, module);

handle('removeAllScriptAccess', async (event, context) => {
    await AuthService.assertOwner(event);
    const body = JSON.parse(event.body);
    return ok(await ScriptAccessService.removeAllAccess(body.scriptId, body.userId))
}, module);
*/

handle({
    name : 'createScript',
    module,
    handler : async (event, context) => {
        //await AuthService.assertOwner(event);
        return ok(await ScriptService.insert(JSON.parse(event.body)))
    } 
});

handle({
    name : 'getScript',
    module,
    handler : async (event, context) => {
        const qs = event.queryStringParameters || {};
        return ok(!qs.id ? null : await ScriptService.getScriptsByDeveloper(qs.id));
    }
});

handle({
    name : 'getScriptAccess',
    module,
    handler : async (event, context) => {
        const qs = event.queryStringParameters || {};
        const user = await UserService.getUserFromRequest(event);
        return ok(await ScriptAccessService.getAccess(qs.scriptId, user.userId))
    }
});

handle({
    name : 'getScriptsForUser',
    module,
    handler : async (event, context) => {
        const user = await UserService.getUserFromRequest(event);
        return ok(await ScriptAccessService.getScripts(user.userId))
    }
});

handle({
    name : 'addScriptAccess',
    rateAction : 'scriptAccessChange',
    rateLimit : 10,
    module,
    handler : async (event, context) => {
        const qs = event.queryStringParameters || {};
        const user = await UserService.getUserFromRequest(event);
        return ok(await ScriptAccessService.addAccess(qs.scriptId, user.userId))
    }
});