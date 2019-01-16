const UserService = require("./userService");

const AuthService = {
    assertOwner : async (request) => {
        const user = await UserService.getUserFromRequest(request);
        const groups = (user || {})["cognito:groups"];
        if(groups.indexOf("Owners") === -1) {
            throw {error : "Unauthorized."}
        }
        return user;
    }
};

module.exports = AuthService;