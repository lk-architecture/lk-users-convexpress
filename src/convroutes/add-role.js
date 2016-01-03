import * as authorize from "./middleware/authorize";
import * as ensureUserExists from "./middleware/ensure-user-exists";
import userHasRole from "./utils/user-has-role";

export default function getConvroute (options) {
    const {dispatchEvent} = options;
    return {
        path: "/users/:userId/roles",
        method: "post",
        description: "Add role to user",
        parameters: [
            {
                name: "userId",
                in: "path",
                required: true
            },
            {
                name: "roleDescriptor",
                in: "body",
                required: true,
                schema: {
                    type: "object",
                    properties: {
                        role: {
                            type: "string"
                        }
                    },
                    additionalProperties: false,
                    required: ["role"]
                }
            }
        ],
        responses: {
            ...authorize.responses,
            ...ensureUserExists.responses,
            "409": {
                description: "User already has role"
            },
            "204": {
                description: "Role addedd successfully"
            }
        },
        middleware: [
            authorize.getMiddleware("addRole", options),
            ensureUserExists.getMiddleware(options)
        ],
        handler: async (req, res) => {
            if (userHasRole(req.targetUser, req.body.role)) {
                return res.status(409).send({
                    message: `User ${req.params.userId} already has role ${req.body.role}`
                });
            }
            await dispatchEvent(
                "role added to user",
                {
                    userId: req.params.userId,
                    role: req.body.role
                },
                {sourceUserId: req.userId}
            );
            res.status(204).send();
        }
    };
}
