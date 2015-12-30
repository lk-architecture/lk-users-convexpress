import * as authorize from "../middleware/authorize";

export default function getConvroute (options) {
    const {dispatchEvent, findUserById} = options;
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
            "404": {
                description: "User not found"
            },
            "204": {
                description: "Profile replaced successfully"
            }
        },
        middleware: [
            authorize.getMiddleware("replaceProfile", options)
        ],
        handler: async (req, res) => {
            const user = findUserById(req.params.userId);
            if (!user) {
                return res.status(404).send({
                    message: `No user found with id ${req.params.userId}`
                });
            }
            await dispatchEvent(
                "profile replaced in user",
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
