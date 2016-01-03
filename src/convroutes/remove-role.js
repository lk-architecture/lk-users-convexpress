import * as authorize from "./middleware/authorize";
import * as ensureUserExists from "./middleware/ensure-user-exists";
import userHasRole from "./utils/user-has-role";

export default function getConvroute (options) {
    const {dispatchEvent} = options;
    return {
        path: "/users/:userId/roles/:role",
        method: "delete",
        description: "Remove role from user",
        tags: ["users"],
        parameters: [
            {
                name: "userId",
                in: "path",
                required: true
            },
            {
                name: "role",
                in: "path",
                required: true
            }
        ],
        responses: {
            ...authorize.responses,
            ...ensureUserExists.responses,
            "204": {
                description: "Role removed successfully"
            }
        },
        middleware: [
            authorize.getMiddleware("removeRole", options),
            ensureUserExists.getMiddleware(options)
        ],
        handler: async (req, res) => {
            if (!userHasRole(req.targetUser, req.params.role)) {
                return res.status(404).send({
                    message: `User ${req.params.userId} has no role ${req.params.role}`
                });
            }
            await dispatchEvent(
                "role removed from user",
                {
                    userId: req.params.userId,
                    role: req.params.role
                },
                {sourceUserId: req.userId}
            );
            res.status(204).send();
        }
    };
}
