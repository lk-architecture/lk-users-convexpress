import * as authorize from "../middleware/authorize";
import * as ensureUserExists from "../middleware/ensure-user-exists";

export default function getConvroute (options) {
    const {dispatchEvent} = options;
    return {
        path: "/users/:userId/profile",
        method: "put",
        description: "Replace user profile",
        parameters: [
            {
                name: "userId",
                in: "path",
                required: true
            },
            {
                name: "profile",
                in: "body",
                required: true,
                schema: {
                    type: "object"
                }
            }
        ],
        responses: {
            ...authorize.responses,
            ...ensureUserExists.responses,
            "204": {
                description: "Profile replaced successfully"
            }
        },
        middleware: [
            authorize.getMiddleware("replaceProfile", options),
            ensureUserExists.getMiddleware(options)
        ],
        handler: async (req, res) => {
            await dispatchEvent(
                "profile replaced for user",
                {
                    userId: req.params.userId,
                    profile: req.body
                },
                {sourceUserId: req.userId}
            );
            res.status(204).send();
        }
    };
}
