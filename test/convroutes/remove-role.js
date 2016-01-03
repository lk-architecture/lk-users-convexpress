import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "supertest-as-promised";

import {getGetServer} from "../test-utils";
import getRemoveRole from "convroutes/remove-role";

chai.use(sinonChai);

describe("DELETE /users/:userId/roles/:role", () => {

    const getServer = getGetServer(getRemoveRole);

    it("404 on user doesn't have the specified role", () => {
        const options = {
            findUserById: () => ({roles: []})
        };
        return request(getServer(options))
            .delete("/users/targetUserId/roles/roleName")
            .expect(404)
            .expect({
                message: "User targetUserId has no role roleName"
            });
    });

    it("dispatches a \"role removed from user\" event", () => {
        const options = {
            dispatchEvent: sinon.spy(),
            findUserById: () => ({roles: ["roleToBeRemoved"]})
        };
        return request(getServer(options))
            .delete("/users/targetUserId/roles/roleToBeRemoved")
            .expect(204)
            .then(() => {
                expect(options.dispatchEvent).to.have.been.calledWith(
                    "role removed from user",
                    {
                        userId: "targetUserId",
                        role: "roleToBeRemoved"
                    },
                    {sourceUserId: "userId"}
                );
            });
    });

    it("204 and returns no content", () => {
        const options = {
            dispatchEvent: sinon.spy(),
            findUserById: () => ({roles: ["roleToBeRemoved"]})
        };
        return request(getServer(options))
            .delete("/users/targetUserId/roles/roleToBeRemoved")
            .expect(204)
            .expect({});
    });

});
