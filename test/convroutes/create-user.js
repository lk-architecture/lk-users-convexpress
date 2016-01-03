import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "supertest-as-promised";

import {getGetServer} from "../test-utils";
import getCreateUser from "convroutes/create-user";

chai.use(sinonChai);

describe("POST /users", () => {

    const getServer = getGetServer(getCreateUser);
    const randomBytes = () => Buffer("0123456789", "hex");
    const v4 = () => "uuid";
    const hash = p => p;

    beforeEach(() => {
        getCreateUser.__Rewire__("randomBytes", randomBytes);
        getCreateUser.__Rewire__("v4", v4);
        getCreateUser.__Rewire__("hash", hash);
    });
    afterEach(() => {
        getCreateUser.__ResetDependency__("randomBytes");
        getCreateUser.__ResetDependency__("v4");
        getCreateUser.__ResetDependency__("hash");
    });

    it("400 on invalid body [CASE: no body]", () => {
        return request(getServer())
            .post("/users")
            .expect(400)
            .expect(/Validation failed/);
    });

    it("400 on invalid body [CASE: missing property]", () => {
        return request(getServer())
            .post("/users")
            .send({email: "test@example.com"})
            .expect(400)
            .expect(/Validation failed/);
    });

    it("400 on invalid body [CASE: invalid property]", () => {
        return request(getServer())
            .post("/users")
            .send({email: "notAnEmail", password: "hunter2"})
            .expect(400)
            .expect(/Validation failed/);
    });

    it("not 400 on valid body", () => {
        return request(getServer())
            .post("/users")
            .send({email: "test@example.com", password: "hunter2"})
            .expect(201);
    });

    it("409 on conflicting email", () => {
        const options = {
            findUserByEmail: () => ({})
        };
        return request(getServer(options))
            .post("/users")
            .send({email: "test@example.com", password: "hunter2"})
            .expect(409)
            .expect({
                message: "A user with that email already exists"
            });
    });

    it("dispatches a \"user created\" event", () => {
        const options = {
            dispatchEvent: sinon.spy()
        };
        return request(getServer(options))
            .post("/users")
            .send({email: "test@example.com", password: "hunter2"})
            .expect(201)
            .then(() => {
                expect(options.dispatchEvent).to.have.been.calledWith(
                    "user created",
                    {
                        userId: "uuid",
                        userObject: {
                            emails: [{
                                address: "test@example.com",
                                verified: false
                            }],
                            profile: {},
                            roles: [],
                            services: {
                                email: {
                                    verificationTokens: [{
                                        address: "test@example.com",
                                        token: "0123456789"
                                    }]
                                },
                                password: {
                                    bcrypt: "hunter2"
                                }
                            }
                        }
                    },
                    {sourceUserId: "userId"}
                );
            });
    });

    it("201 and returns the created user id", () => {
        return request(getServer())
            .post("/users")
            .send({email: "test@example.com", password: "hunter2"})
            .expect(201)
            .expect({
                id: "uuid"
            });
    });

});
