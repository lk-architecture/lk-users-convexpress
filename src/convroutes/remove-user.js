import * as authorize from "../middleware/authorize";
import * as ensureUserExists from "../middleware/ensure-user-exists";

export default function getConvroute (options) {
    const {dispatchEvent} = options;
    return {
        path: "/users/:userId",
        method: "delete",
        description: "Remove user",
        parameters: [{
            name: "userId",
            in: "path",
            required: true
        }],
        responses: {
            ...authorize.responses,
            ...ensureUserExists.responses,
            "204": {
                description: "User removed successfully"
            }
        },
        middleware: [
            authorize.getMiddleware("removeUser", options),
            ensureUserExists.getMiddleware(options)
        ],
        handler: async (req, res) => {
            await dispatchEvent(
                "user removed",
                {userId: req.params.userId},
                {sourceUserId: req.userId}
            );
            res.status(204).send();
        }
    };
}
