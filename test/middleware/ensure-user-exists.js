import express from "express";
import request from "supertest-as-promised";

import {getMiddleware} from "middleware/ensure-user-exists";

describe("ensureUserExists middleware", () => {

    it("404 on user not found", () => {
        const options = {
            findUserById: () => null
        };
        const server = express()
            .use("/users/:userId", getMiddleware(options))
            .get("/users/:userId", (req, res) => res.status(200).send());
        return request(server)
            .get("/users/userId")
            .expect(404)
            .expect({
                message: "No user found with id userId"
            });
    });

    it("not 404 on user found", () => {
        const options = {
            findUserById: () => ({})
        };
        const server = express()
            .use("/users/:userId", getMiddleware(options))
            .get("/users/:userId", (req, res) => res.status(200).send());
        return request(server)
            .get("/users/userId")
            .expect(200);
    });

    it("sets `req.targetUser` to the found user", () => {
        const options = {
            findUserById: () => ({id: "userId"})
        };
        const server = express()
            .use("/users/:userId", getMiddleware(options))
            .get("/users/:userId", (req, res) => res.status(200).send(req.targetUser));
        return request(server)
            .get("/users/userId")
            .expect(200)
            .expect({id: "userId"});
    });

});
