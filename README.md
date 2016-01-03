[![npm version](https://badge.fury.io/js/lk-users-convexpress.svg)](https://badge.fury.io/js/lk-users-convexpress)
[![Build Status](https://travis-ci.org/lk-architecture/lk-users-convexpress.svg?branch=master)](https://travis-ci.org/lk-architecture/lk-users-convexpress)
[![codecov.io](https://codecov.io/github/lk-architecture/lk-users-convexpress/coverage.svg?branch=master)](https://codecov.io/github/lk-architecture/lk-users-convexpress?branch=master)
[![Dependency Status](https://david-dm.org/lk-architecture/lk-users-convexpress.svg)](https://david-dm.org/lk-architecture/lk-users-convexpress)
[![devDependency Status](https://david-dm.org/lk-architecture/lk-users-convexpress/dev-status.svg)](https://david-dm.org/lk-architecture/lk-users-convexpress#info=devDependencies)

# lk-users-convexpress

Convexpress routes to implement a user system in the lk-architecture.

## Usage

Example usage with mongodb as database.

```js
import {Kinesis} from "aws-sdk";
import convexpress from "convexpress";
import express from "express";
import getDispatch from "lk-dispatch";
import {getConvroutes, getAuthenticateMiddleware} from "lk-users-convexpress";

const dispatchEvent = getDispatch({
    kinesisClient: new Kinesis(),
    kinesisStream: "entrypoint",
    producerId: "server@hostname"
});

const usersOptions = {
    jwtSecret: new Buffer("jwtSecret"),
    jwtIssuer: "jwtIssuer",
    dispatchEvent: dispatchEvent,
    findUserByEmail: async (email) => {
        const db = await mongodb;
        return db.collection("users").findOne({"emails.address": email});
    },
    findUserById: async (userId) => {
        const db = await mongodb;
        return db.collection("users").findOne({_id: userId});
    },
    getUserId: user => user._id,
    allowSignup: false
};
const usersConvroutes = getConvroutes(usersOptions);
const authenticate = getAuthenticateMiddleware(usersOptions);

const convrouter = convexpress()
    .convroute(usersConvroutes.login)
    .use(authenticate)
    .convroute(createUser)
    .convroute(removeUser)
    .convroute(addRole)
    .convroute(removeRole)
    .convroute(replaceProfile);

express()
    .use(convrouter)
    .listen(process.env.PORT);
```

## API

* `getConvroutes(options)` => returns an object with all defined convroutes
* `getAuthenticateMiddleware(options)` => returns a middleware function to
  authenticate requests

### `options`

* `jwtSecret`
* `jwtIssuer`
* `dispatchEvent`
* `findUserByEmail`
* `findUserById`
* `getUserId`
* `allowSignup` (optional)
