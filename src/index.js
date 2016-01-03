import getAddRole from "./convroutes/add-role";
import getCreateUser from "./convroutes/create-user";
import getLogin from "./convroutes/login";
import getRemoveRole from "./convroutes/remove-role";
import getRemoveUser from "./convroutes/remove-user";
import getReplaceProfile from "./convroutes/replace-profile";

export function getConvroutes (options) {
    return {
        addRole: getAddRole(options),
        createUser: getCreateUser(options),
        login: getLogin(options),
        removeRole: getRemoveRole(options),
        removeUser: getRemoveUser(options),
        replaceProfile: getReplaceProfile(options)
    };
}

export {default as getAuthenticateMiddleware} from "./middleware/authenticate";
