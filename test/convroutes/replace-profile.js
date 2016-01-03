import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "supertest-as-promised";

import {getGetServer} from "../test-utils";
import getReplaceProfile from "convroutes/replace-profile";

chai.use(sinonChai);

describe("PUT /users/:userId/profile", () => {

    const getServer = getGetServer(getReplaceProfile);

    it("400 on missing body", () => {
        return request(getServer())
            .put("/users/targetUserId/profile")
            .expect(400)
            .expect(/Validation failed/);
    });

    it("not 400 on empty body", () => {
        const options = {
            findUserById: () => ({}),
            dispatchEvent: sinon.spy()
        };
        return request(getServer(options))
            .put("/users/targetUserId/profile")
            .send({})
            .expect(204);
    });

    it("dispatches a \"profile replaced for user\" event", () => {
        const options = {
            findUserById: () => ({}),
            dispatchEvent: sinon.spy()
        };
        return request(getServer(options))
            .put("/users/targetUserId/profile")
            .send({key: "value"})
            .expect(204)
            .then(() => {
                expect(options.dispatchEvent).to.have.been.calledWith(
                    "profile replaced for user",
                    {
                        userId: "targetUserId",
                        profile: {key: "value"}
                    },
                    {sourceUserId: "userId"}
                );
            });
    });

    it("204 and returns no content", () => {
        const options = {
            findUserById: () => ({}),
            dispatchEvent: sinon.spy()
        };
        return request(getServer(options))
            .put("/users/targetUserId/profile")
            .send({key: "value"})
            .expect(204)
            .expect({});
    });

});
