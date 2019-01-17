const UserService = require("../services/userService");
const {ok, createHandler} = require('./util/lambda');

createHandler('login', async (event, context) => {
    const body = JSON.parse(event.body);
    return ok(await UserService.login(body.email, body.password));
}, module);

createHandler('me', async (event, context) => {
    return ok(await UserService.getFullUserFromRequest(event));
}, module);

createHandler('getUserByUsername', async (event, context) => {
    await AuthService.assertOwner(event);
    const qs = event.queryStringParameters || {};
    return ok(await UserService.getFullUserByUsername(qs.username));
}, module);