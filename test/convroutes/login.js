import request from "supertest-as-promised";
import sinon from "sinon";
import {sign} from "jsonwebtoken";

import {getGetServer} from "../test-utils";
import getLogin from "convroutes/login";
import {hash} from "utils/bcrypt";

describe("POST /login", () => {

    const getServer = getGetServer(getLogin);
    var clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        getLogin.__Rewire__("v4", () => "uuid");
    });
    afterEach(() => {
        getLogin.__ResetDependency__("v4");
        clock.restore();
    });

    it("400 on invalid body [CASE: missing body]", () => {
        return request(getServer())
            .post("/login")
            .expect(400)
            .expect(/Validation failed/);
    });

    it("400 on invalid body [CASE: missing property]", () => {
        return request(getServer())
            .post("/login")
            .send({password: "hunter2"})
            .expect(400)
            .expect(/Validation failed/);
    });

    it("400 on invalid body [CASE: invalid property]", () => {
        return request(getServer())
            .post("/login")
            .send({email: "example.com", password: "hunter2"})
            .expect(400)
            .expect(/Validation failed/);
    });

    it("404 on user not found", () => {
        const options = {
            findUserByEmail: () => null
        };
        return request(getServer(options))
            .post("/login")
            .send({email: "test@example.com", password: "hunter2"})
            .expect(404)
            .expect({
                message: "User not found"
            });
    });

    it("401 on password not matching", () => {
        const options = {
            findUserByEmail: () => ({
                services: {
                    password: {
                        bcrypt: hash("hunter2")
                    }
                }
            })
        };
        return request(getServer(options))
            .post("/login")
            .send({email: "test@example.com", password: "notHunter2"})
            .expect(401)
            .expect({
                message: "Invalid password"
            });
    });

    it("200 and token on correct password", () => {
        const options = {
            getUserId: () => "userId",
            findUserByEmail: () => ({
                services: {
                    password: {
                        bcrypt: hash("hunter2")
                    }
                }
            }),
            jwtIssuer: "jwtIssuer",
            jwtSecret: "jwtSecret"
        };
        const token = sign({
            sub: "userId",
            iss: "jwtIssuer",
            jti: "uuid"
        }, "jwtSecret");
        return request(getServer(options))
            .post("/login")
            .send({email: "test@example.com", password: "hunter2"})
            .expect(200)
            .expect({token});
    });

});
