const CognitoService = require('./cognitoService');
const Redis = require("../wrappers/redisWrapper");

const getUserFromRequest = async (request) => {
    const auth = request.headers.Authorization;
    return !auth ? null : await CognitoService.decode(auth.toString().replace("Bearer ", ""));
};

const getFullUserById = async (id) => {
    return await Redis.getAndSet(`user-by-id-${id}`, async () => {
        const user = await CognitoService.getUserById(id);
        if(user) {
            await Redis.set(`user-by-username-${user.username.toLowerCase().trim()}`, user);
        }
        return user;
    })
};

const getFullUserByUsername = async (username) => {
    return await Redis.getAndSet(`user-by-username-${username.toLowerCase().trim()}`, async () => {
        const results = await CognitoService.searchByUsername(username);
        if(!results || results.length === 0) {
            return null;
        }
        const first = results[0];
        if(first.username.toString().toLowerCase() === username.toString().toLowerCase()) {
            return first;
        }
        return null;
    });
};

const getFullUserFromRequest = async (request) => {
    const user = await getUserFromRequest(request);
    return !user ? null : await getFullUserById(user.sub);
};

const UserService = {
    login : CognitoService.login,
    getUserFromRequest,
    getFullUserById,
    getFullUserFromRequest,
    getFullUserByUsername
};

module.exports = UserService;