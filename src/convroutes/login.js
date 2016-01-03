import {sign} from "jsonwebtoken";
import {v4} from "node-uuid";

import {compare} from "../utils/bcrypt";

export default function getConvroute (options) {
    const {findUserByEmail, getUserId, jwtIssuer, jwtSecret} = options;
    return {
        path: "/login",
        method: "post",
        description: "Obtain a jwt api token",
        parameters: [{
            name: "credentials",
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
            "404": {
                description: "User not found"
            },
            "401": {
                description: "Invalid password"
            },
            "200": {
                description: "Credentials match, return jwt token"
            }
        },
        handler: async (req, res) => {
            const user = await findUserByEmail(req.body.email);
            if (!user) {
                return res.status(404).send({
                    message: "User not found"
                });
            }
            if (!compare(req.body.password, user.services.password.bcrypt)) {
                return res.status(401).send({
                    message: "Invalid password"
                });
            }
            const token = sign({
                sub: getUserId(user),
                iss: jwtIssuer,
                jti: v4()
            }, jwtSecret);
            res.status(200).send({token});
        }
    };
}
