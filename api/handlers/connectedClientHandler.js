const ConnectedClientService = require("../services/connectedClientService");
const UserService = require("../services/userService");
const {handle, ok} = require("./util/lambda");

handle('ping', async (event, context) => {
    const v = await getValues(event);
    await ConnectedClientService.upsertConnectedClient(v.clientId, v.userId);
    return ok();
}, module);

handle('disconnect', async (event, context) => {
    const v = await getValues(event);
    await ConnectedClientService.disconnectClient(v.clientId, v.userId);
    return ok();
}, module);

handle('count', async (event, context) => {
    const v = await getValues(event, false);
    const count = await ConnectedClientService.getCount(v.userId);
    return ok({count});
}, module);

const getValues = async (event, requireClientId = true) => {
    const qs = event.queryStringParameters || {};
    const user = await UserService.getUserFromRequest(event);
    if((requireClientId && !qs.clientId) || !user) {
        throw "Client id or user missing.";
    }
    return {clientId : qs.clientId, userId : user.userId}
};