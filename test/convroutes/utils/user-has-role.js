import {expect} from "chai";

import userHasRole from "convroutes/utils/user-has-role";

describe("userHasRole util", () => {

    const user = {
        roles: [
            "admin",
            "notAdmin",
            "person",
            "manager"
        ]
    };

    it("returns true when the user has the specified role", () => {
        expect(userHasRole(user, "admin")).to.equal(true);
        expect(userHasRole(user, "notAdmin")).to.equal(true);
        expect(userHasRole(user, "person")).to.equal(true);
        expect(userHasRole(user, "manager")).to.equal(true);
    });

    it("returns false when the user does not have the specified role", () => {
        expect(userHasRole(user, "anAdmin")).to.equal(false);
        expect(userHasRole(user, "NotAdmin")).to.equal(false);
        expect(userHasRole(user, "pearson")).to.equal(false);
        expect(userHasRole(user, "manger")).to.equal(false);
    });

});
