const UserService = require("../services/userService");
const AuthService = require("../services/authService");
const {ok, handle} = require('./util/lambda');

handle('login', async (event, context) => {
    const body = JSON.parse(event.body);
    return ok(await UserService.login(body.email, body.password));
}, module);

handle('me', async (event, context) => {
    return ok(await UserService.getFullUserFromRequest(event));
}, module);

handle('getUserByUsername', async (event, context) => {
    await AuthService.assertOwner(event);
    const qs = event.queryStringParameters || {};
    return ok(await UserService.getFullUserByUsername(qs.username));
}, module);