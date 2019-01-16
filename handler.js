'use strict';
const AuthService = require("./services/authService");
const UserService = require("./services/userService");
const ScriptService = require("./services/script/scriptService");
const ScriptAccessService = require("./services/script/scriptAccessService");
const {ok, createHandler} = require('./wrappers/lambda');

createHandler('getScript', async (event, context) => {
  const qs = event.queryStringParameters || {};
  return ok(!qs.id ? null : await ScriptService.getScript(qs.id));
}, module);

createHandler('createScript', async (event, context) => {
  await AuthService.assertOwner(event);
  return ok(await ScriptService.insert(JSON.parse(event.body)))
}, module);

createHandler('getScriptAccess', async (event, context) => {
  const user = await UserService.getUserFromRequest(event);
  console.log(user);
  return ok(await ScriptAccessService.getAccess(user.userId));
}, module);

createHandler('addScriptAccess', async (event, context) => {
  await AuthService.assertOwner(event);
  const body = JSON.parse(event.body);
  return ok(await ScriptAccessService.addAccess(body.scriptId, body.userId))
}, module);

createHandler('removeAllScriptAccess', async (event, context) => {
  await AuthService.assertOwner(event);
  const body = JSON.parse(event.body);
  return ok(await ScriptAccessService.removeAllAccess(body.scriptId, body.userId))
}, module);


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

