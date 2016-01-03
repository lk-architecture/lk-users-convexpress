import {randomBytes} from "crypto";
import {v4} from "node-uuid";

import {hash} from "./utils/bcrypt";
import * as authorize from "./middleware/authorize";

export default function getConvroute (options) {
    const {dispatchEvent, findUserByEmail} = options;
    return {
        path: "/users",
        method: "post",
        description: "Create user",
        parameters: [{
            name: "user",
            in: "body",
            required: true,
            schema: {
                type: "object",
                properties: {
                    email: {
                        description: "Email",
                        type: "string",
                        format: "email"
                    },
                    password: {
                        description: "Password",
                        type: "string"
                    }
                },
                additionalProperties: false,
                required: ["email", "password"]
            }
        }],
        responses: {
            ...authorize.responses,
            "409": {
                description: "Conflicting email"
            },
            "201": {
                description: "User created successfully"
            }
        },
        middleware: [
            authorize.getMiddleware("createUser", options)
        ],
        handler: async (req, res) => {
            if (await findUserByEmail(req.body.email)) {
                return res.status(409).send({
                    message: "A user with that email already exists"
                });
            }
            const user = {
                emails: [{
                    address: req.body.email,
                    verified: false
                }],
                profile: {},
                roles: [],
                services: {
                    email: {
                        verificationTokens: [{
                            address: req.body.email,
                            token: randomBytes(64).toString("hex")
                        }]
                    },
                    password: {
                        bcrypt: hash(req.body.password)
                    }
                }
            };
            const userId = v4();
            await dispatchEvent(
                "user created",
                {
                    userId: userId,
                    userObject: user
                },
                {sourceUserId: req.userId}
            );
            res.status(201).send({id: userId});
        }
    };
}
