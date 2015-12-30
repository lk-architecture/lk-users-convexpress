import * as authorize from "../middleware/authorize";

export default function getConvroute (options) {
    const {dispatchEvent, findUserById} = options;
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
            "404": {
                description: "User not found"
            },
            "204": {
                description: "User removed successfully"
            }
        },
        middleware: [
            authorize.getMiddleware("removeUser", options)
        ],
        handler: async (req, res) => {
            const user = findUserById(req.params.userId);
            if (!user) {
                return res.status(404).send({
                    message: `No user found with id ${req.params.userId}`
                });
            }
            await dispatchEvent(
                "user removed",
                {id: req.params.userId},
                {sourceUserId: req.userId}
            );
            res.status(204).send();
        }
    };
}
