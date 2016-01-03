import express from "express";
import request from "supertest-as-promised";
import {sign} from "jsonwebtoken";

import authenticate from "middleware/authenticate";

describe("authenticate middleware", () => {

    function getServer (options) {
        const baseOptions = {
            findUserById: () => null,
            getUserId: () => null,
            jwtIssuer: "jwtIssuer",
            jwtSecret: new Buffer("jwtSecret")
        };
        return express()
            .use(authenticate({...baseOptions, ...options}))
            .get("/", (req, res) => res.status(200).send({
                user: req.user,
                userId: req.userId
            }));
    }

    it("401 on no jwt", () => {
        return request(getServer())
            .get("/")
            .expect(401)
            .expect({message: "No authorization token was found"});
    });

    it("401 on incorrect jwt", () => {
        return request(getServer())
            .get("/")
            .set("Authorization", "Bearer not-a-jwt")
            .expect(401)
            .expect({message: "jwt malformed"});
    });

    it("401 on invalid jwt signature [CASE: incorrect encoding]", () => {
        const options = {
            jwtSecret: new Buffer("jwtSecret")
        };
        const token = sign({iss: "jwtIssuer"}, options.jwtSecret.toString("base64"));
        return request(getServer(options))
            .get("/")
            .set("Authorization", `Bearer ${token}`)
            .expect(401)
            .expect({message: "invalid signature"});
    });

    it("401 on invalid jwt signature [CASE: different secret]", () => {
        const token = sign({iss: "jwtIssuer"}, new Buffer("different secret"));
        return request(getServer())
            .get("/")
            .set("Authorization", `Bearer ${token}`)
            .expect(401)
            .expect({message: "invalid signature"});
    });

    it("401 on invalid jwt issuer", () => {
        const token = sign({}, new Buffer("jwtSecret"));
        return request(getServer())
            .get("/")
            .set("Authorization", `Bearer ${token}`)
            .expect(401)
            .expect({message: "jwt issuer invalid. expected: jwtIssuer"});
    });

    it("401 on expired jwt", () => {
        const token = sign({iss: "jwtIssuer", exp: 0}, new Buffer("jwtSecret"));
        return request(getServer())
            .get("/")
            .set("Authorization", `Bearer ${token}`)
            .expect(401)
            .expect({message: "jwt expired"});
    });

    it("401 on valid token but no user", () => {
        const options = {
            findUserById: () => null
        };
        const token = sign({iss: "jwtIssuer", sub: "anotherUserId"}, new Buffer("jwtSecret"));
        return request(getServer(options))
            .get("/")
            .set("Authorization", `Bearer ${token}`)
            .expect(401)
            .expect({message: "Token has no corresponding user"});
    });

    it("not 401 on valid token with existing user", () => {
        const options = {
            findUserById: () => ({})
        };
        const token = sign({iss: "jwtIssuer", sub: "anotherUserId"}, new Buffer("jwtSecret"));
        return request(getServer(options))
            .get("/")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
    });

    it("decorates the request with the user object and the userId", () => {
        const options = {
            findUserById: () => ({_id: "userId"}),
            getUserId: user => user._id
        };
        const token = sign({iss: "jwtIssuer", sub: "anotherUserId"}, new Buffer("jwtSecret"));
        return request(getServer(options))
            .get("/")
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .expect({
                user: {
                    _id: "userId"
                },
                userId: "userId"
            });
    });

});
