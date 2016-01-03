export const responses = {
    "403": {
        description: "Cannot perfom the operation"
    }
};

function isAdmin (user) {
    return (user && user.roles.indexOf("admin") !== -1);
}

function getAuthResult (authorized, reason) {
    return {authorized, reason};
}

const authorize = {

    createUser (req, options) {
        return (
            isAdmin(req.user) || options.allowSignup ?
            getAuthResult(true) :
            getAuthResult(false, "Only admins can create users")
        );
    },

    removeUser (req) {
        return (
            isAdmin(req.user) ?
            getAuthResult(true) :
            getAuthResult(false, "Only admins can remove a user")
        );
    },

    replaceProfile (req) {
        return (
            isAdmin(req.user) || req.userId === req.params.userId ?
            getAuthResult(true) :
            getAuthResult(false, "Only admins or the user themselves can replace a user profile")
        );
    },

    addRole (req) {
        return (
            isAdmin(req.user) ?
            getAuthResult(true) :
            getAuthResult(false, "Only admins can add roles")
        );
    },

    removeRole (req) {
        return (
            isAdmin(req.user) ?
            getAuthResult(true) :
            getAuthResult(false, "Only admins can remove roles")
        );
    }

};

export function getMiddleware (operation, options) {
    return async (req, res, next) => {
        // Run the appropriate authorize function
        const authResult = authorize[operation](req, options);
        // Ensure request is authorized
        if (!authResult.authorized) {
            res.status(403).send({
                message: authResult.reason
            });
        } else {
            next();
        }
    };
}
