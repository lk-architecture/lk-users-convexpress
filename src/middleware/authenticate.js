import jwt from "express-jwt";

export default function getMiddleware (options) {
    const {findUserById, getUserId, jwtIssuer, jwtSecret} = options;
    const jwtMiddleware = jwt({
        issuer: jwtIssuer,
        secret: jwtSecret
    });
    return (req, res, next) => {
        jwtMiddleware(req, res, async (err) => {
            if (err) {
                return res.status(401).send({
                    message: err.message
                });
            }
            /*
            *   On successful verification of the jwt token, the jwt middleware
            *   decorates the request assigning the token payload to the `user`
            *   property of the request. We overwrite this behaviour assigning
            *   to the `user` property the user object retrieved from the
            *   database.
            */
            const user = await findUserById(req.user.sub);
            if (!user) {
                return res.status(401).send({
                    message: "Token has no corresponding user"
                });
            }
            req.user = user;
            req.userId = getUserId(user);
            next();
        });
    };
}
