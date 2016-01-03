import convexpress from "convexpress";
import express from "express";

function makeAdminMiddleware (req, res, next) {
    req.user = {
        roles: ["admin"]
    };
    req.userId = "userId";
    next();
}

export function getGetServer (getConvroute) {
    return options => {
        const baseOptions = {
            dispatchEvent: () => null,
            findUserByEmail: () => null,
            findUserById: () => null,
            getUserId: () => null,
            jwtIssuer: "jwtIssuer",
            jwtSecret: new Buffer("jwtSecret")
        };
        const convroute = getConvroute({
            ...baseOptions,
            ...options
        });
        const convrouter = convexpress({}).convroute(convroute);
        return express()
            .use(makeAdminMiddleware)
            .use(convrouter);
    };
}
