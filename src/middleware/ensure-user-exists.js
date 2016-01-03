export const responses = {
    "404": {
        description: "User not found"
    }
};

export function getMiddleware (options) {
    const {findUserById} = options;
    return async (req, res, next) => {
        const user = findUserById(req.params.userId);
        if (user) {
            req.targetUser = user;
            next();
        } else {
            res.status(404).send({
                message: `No user found with id ${req.params.userId}`
            });
        }
    };
}
