import express from "express";
import request from "supertest-as-promised";

import {getMiddleware} from "middleware/authorize";

describe("authorize middleware [OPERATION: createUser]", () => {

    describe("allowSignup === true", () => {

        it("allowed for admins", () => {
            const server = express()
                .use((req, res, next) => {
                    req.user = {
                        roles: ["admin"]
                    };
                    next();
                })
                .use("/users", getMiddleware("createUser", {allowSignup: true}))
                .post("/users", (req, res) => res.status(200).send());
            return request(server)
                .post("/users")
                .expect(200);
        });

        it("also allowed for everyone else [CASE: signed in user]", () => {
            const server = express()
                .use((req, res, next) => {
                    req.user = {roles: []};
                    next();
                })
                .use("/users", getMiddleware("createUser", {allowSignup: true}))
                .post("/users", (req, res) => res.status(200).send());
            return request(server)
                .post("/users")
                .expect(200);
        });

        it("also allowed for everyone else [CASE: anonymous user]", () => {
            const server = express()
                .use("/users", getMiddleware("createUser", {allowSignup: true}))
                .post("/users", (req, res) => res.status(200).send());
            return request(server)
                .post("/users")
                .expect(200);
        });

    });

    describe("allowSignup !== true", () => {

        it("allowed for admins", () => {
            const server = express()
                .use((req, res, next) => {
                    req.user = {roles: ["admin"]};
                    next();
                })
                .use("/users", getMiddleware("createUser", {}))
                .post("/users", (req, res) => res.status(200).send());
            return request(server)
                .post("/users")
                .expect(200);
        });

        it("not allowed for anyone else [CASE: signed in user]", () => {
            const server = express()
                .use((req, res, next) => {
                    req.user = {roles: []};
                    next();
                })
                .use("/users", getMiddleware("createUser", {}))
                .post("/users", (req, res) => res.status(200).send());
            return request(server)
                .post("/users")
                .expect(403)
                .expect({
                    message: "Only admins can create users"
                });
        });

        it("not allowed for anyone else [CASE: anonymous user]", () => {
            const server = express()
                .use("/users", getMiddleware("createUser", {}))
                .post("/users", (req, res) => res.status(200).send());
            return request(server)
                .post("/users")
                .expect(403)
                .expect({
                    message: "Only admins can create users"
                });
        });

    });

});

describe("authorize middleware [OPERATION: removeUser]", () => {

    it("allowed for admins", () => {
        const server = express()
            .use((req, res, next) => {
                req.user = {roles: ["admin"]};
                next();
            })
            .use("/users/:userId", getMiddleware("removeUser", {}))
            .delete("/users/:userId", (req, res) => res.status(200).send());
        return request(server)
            .delete("/users/userId")
            .expect(200);
    });

    it("not allowed for anyone else [CASE: signed in user]", () => {
        const server = express()
            .use((req, res, next) => {
                req.user = {roles: []};
                next();
            })
            .use("/users/:userId", getMiddleware("removeUser", {}))
            .delete("/users/:userId", (req, res) => res.status(200).send());
        return request(server)
            .delete("/users/userId")
            .expect(403)
            .expect({
                message: "Only admins can remove a user"
            });
    });

    it("not allowed for anyone else [CASE: anonymous user]", () => {
        const server = express()
            .use("/users/:userId", getMiddleware("removeUser", {}))
            .delete("/users/:userId", (req, res) => res.status(200).send());
        return request(server)
            .delete("/users/userId")
            .expect(403)
            .expect({
                message: "Only admins can remove a user"
            });
    });

});

describe("authorize middleware [OPERATION: replaceProfile]", () => {

    it("allowed for admins on self", () => {
        const server = express()
            .use((req, res, next) => {
                req.user = {roles: ["admin"]};
                req.userId = "userId";
                next();
            })
            .use("/users/:userId/profile", getMiddleware("replaceProfile", {}))
            .put("/users/:userId/profile", (req, res) => res.status(200).send());
        return request(server)
            .put("/users/userId/profile")
            .expect(200);
    });

    it("allowed for admins on others", () => {
        const server = express()
            .use((req, res, next) => {
                req.user = {roles: ["admin"]};
                req.userId = "userId";
                next();
            })
            .use("/users/:userId/profile", getMiddleware("replaceProfile", {}))
            .put("/users/:userId/profile", (req, res) => res.status(200).send());
        return request(server)
            .put("/users/targetUserId/profile")
            .expect(200);
    });

    it("allowed for anyone on self", () => {
        const server = express()
            .use((req, res, next) => {
                req.userId = "targetUserId";
                next();
            })
            .use("/users/:userId/profile", getMiddleware("replaceProfile", {}))
            .put("/users/:userId/profile", (req, res) => res.status(200).send());
        return request(server)
            .put("/users/targetUserId/profile")
            .expect(200);
    });

    it("not allowed for anyone on others [CASE: signed in user]", () => {
        const server = express()
            .use((req, res, next) => {
                req.userId = "userId";
                next();
            })
            .use("/users/:userId/profile", getMiddleware("replaceProfile", {}))
            .put("/users/:userId/profile", (req, res) => res.status(200).send());
        return request(server)
            .put("/users/targetUserId/profile")
            .expect(403)
            .expect({
                message: "Only admins or the user themselves can replace a user profile"
            });
    });

    it("not allowed for anyone on others [CASE: anonymous user]", () => {
        const server = express()
            .use("/users/:userId/profile", getMiddleware("replaceProfile", {}))
            .put("/users/:userId/profile", (req, res) => res.status(200).send());
        return request(server)
            .put("/users/targetUserId/profile")
            .expect(403)
            .expect({
                message: "Only admins or the user themselves can replace a user profile"
            });
    });

});

describe("authorize middleware [OPERATION: addRole]", () => {

    it("allowed for admins", () => {
        const server = express()
            .use((req, res, next) => {
                req.user = {roles: ["admin"]};
                next();
            })
            .use("/users/:userId/roles", getMiddleware("addRole", {}))
            .post("/users/:userId/roles", (req, res) => res.status(200).send());
        return request(server)
            .post("/users/userId/roles")
            .expect(200);
    });

    it("not allowed for anyone else [CASE: signed in user]", () => {
        const server = express()
            .use((req, res, next) => {
                req.user = {roles: ["notAnAdmin"]};
                req.userId = "userId";
                next();
            })
            .use("/users/:userId/roles", getMiddleware("addRole", {}))
            .post("/users/:userId/roles", (req, res) => res.status(200).send());
        return request(server)
            .post("/users/userId/roles")
            .expect(403);
    });

    it("not allowed for anyone else [CASE: anonymous user]", () => {
        const server = express()
            .use("/users/:userId/roles", getMiddleware("addRole", {}))
            .post("/users/:userId/roles", (req, res) => res.status(200).send());
        return request(server)
            .post("/users/userId/roles")
            .expect(403);
    });

});

describe("authorize middleware [OPERATION: removeRole]", () => {

    it("allowed for admins", () => {
        const server = express()
            .use((req, res, next) => {
                req.user = {roles: ["admin"]};
                next();
            })
            .use("/users/:userId/roles/:roleName", getMiddleware("removeRole", {}))
            .delete("/users/:userId/roles/:roleName", (req, res) => res.status(200).send());
        return request(server)
            .delete("/users/userId/roles/roleName")
            .expect(200);
    });

    it("not allowed for anyone else [CASE: signed in user]", () => {
        const server = express()
            .use((req, res, next) => {
                req.user = {roles: ["notAnAdmin"]};
                req.userId = "userId";
                next();
            })
            .use("/users/:userId/roles/:roleName", getMiddleware("removeRole", {}))
            .delete("/users/:userId/roles/:roleName", (req, res) => res.status(200).send());
        return request(server)
            .delete("/users/userId/roles/roleName")
            .expect(403);
    });

    it("not allowed for anyone else [CASE: anonymous user]", () => {
        const server = express()
            .use("/users/:userId/roles/:roleName", getMiddleware("removeRole", {}))
            .delete("/users/:userId/roles/:roleName", (req, res) => res.status(200).send());
        return request(server)
            .delete("/users/userId/roles/roleName")
            .expect(403);
    });

});
