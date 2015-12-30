import * as authorize from "../middleware/authorize";

export default function getConvroute (options) {
    const {dispatchEvent, findUserById} = options;
    return {
        path: "/users/:userId/roles/:role",
        method: "post",
        description: "Add role to user",
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
            "404": {
                description: "User not found"
            },
            "409": {
                description: "User already has role"
            },
            "204": {
                description: "Role addedd successfully"
            }
        },
        middleware: [
            authorize.getMiddleware("addRole", options)
        ],
        handler: async (req, res) => {
            const user = findUserById(req.params.userId);
            if (!user) {
                return res.status(404).send({
                    message: `No user found with id ${req.params.userId}`
                });
            }
            if (user.roles.indexOf(req.params.role) !== -1) {
                return res.status(409).send({
                    message: `User ${req.params.userId} already has role ${req.params.role}`
                });
            }
            await dispatchEvent(
                "role added to user",
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
