import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import request from "supertest-as-promised";

import {getGetServer} from "../test-utils";
import getRemoveUser from "convroutes/remove-user";

chai.use(sinonChai);

describe("DELETE /users/:userId", () => {

    const getServer = getGetServer(getRemoveUser);

    it("dispatches a \"user removed\" event", () => {
        const options = {
            findUserById: () => ({}),
            dispatchEvent: sinon.spy()
        };
        return request(getServer(options))
            .delete("/users/targetUserId")
            .expect(204)
            .then(() => {
                expect(options.dispatchEvent).to.have.been.calledWith(
                    "user removed",
                    {userId: "targetUserId"},
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
            .delete("/users/targetUserId")
            .expect(204)
            .expect({});
    });

});
