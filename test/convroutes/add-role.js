import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "supertest-as-promised";

import {getGetServer} from "../test-utils";
import getAddRole from "convroutes/add-role";

chai.use(sinonChai);

describe("POST /users/:userId/roles", () => {

    const getServer = getGetServer(getAddRole);

    it("400 on invalid body [CASE: missing body]", () => {
        return request(getServer())
            .post("/users/targetUserId/roles")
            .expect(400)
            .expect(/Validation failed/);
    });

    it("400 on invalid body [CASE: missing property]", () => {
        return request(getServer())
            .post("/users/targetUserId/roles")
            .send({})
            .expect(400)
            .expect(/Validation failed/);
    });

    it("400 on invalid body [CASE: invalid property]", () => {
        return request(getServer())
            .post("/users/targetUserId/roles")
            .send({role: {}})
            .expect(400)
            .expect(/Validation failed/);
    });

    it("409 on user already has role", () => {
        const options = {
            findUserById: () => ({roles: ["existingRole"]})
        };
        return request(getServer(options))
            .post("/users/targetUserId/roles")
            .send({role: "existingRole"})
            .expect(409)
            .expect({
                message: "User targetUserId already has role existingRole"
            });
    });

    it("dispatches a \"role added to user\" event", () => {
        const options = {
            dispatchEvent: sinon.spy(),
            findUserById: () => ({roles: []})
        };
        return request(getServer(options))
            .post("/users/targetUserId/roles")
            .send({role: "roleToBeAdded"})
            .expect(204)
            .then(() => {
                expect(options.dispatchEvent).to.have.been.calledWith(
                    "role added to user",
                    {
                        userId: "targetUserId",
                        role: "roleToBeAdded"
                    },
                    {sourceUserId: "userId"}
                );
            });
    });

    it("204 and returns no content", () => {
        const options = {
            dispatchEvent: sinon.spy(),
            findUserById: () => ({roles: []})
        };
        return request(getServer(options))
            .post("/users/targetUserId/roles")
            .send({role: "roleToBeAdded"})
            .expect(204)
            .expect({});
    });

});
