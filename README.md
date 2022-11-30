# @cyclic.sh/session-store

Express middleware that stores sessions in DynamoDB tables for Cyclic apps.

[![Discord](https://img.shields.io/discord/895292239633338380)](https://discord.cyclic.sh/support) [![CI](https://github.com/cyclic-software/session-store/actions/workflows/run_tests.yaml/badge.svg)](https://github.com/cyclic-software/session-store/actions/workflows/run_tests.yaml) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

[![npm (scoped)](https://img.shields.io/npm/v/@cyclic.sh/session-store)](https://www.npmjs.com/package/@cyclic.sh/session-store) ![node-current (scoped)](https://img.shields.io/node/v/@cyclic.sh/session-store) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@cyclic.sh/session-store)

Sessions to allow the server to maintain the state across many page requests and keep users logged in.

While it is common to use in-memory sessions, it is generally good practice to store sessions in a database. It is more secure, resilient and easier to debug. 

> **A database session store is especially important in serverless runtimes.** Memory is not guaranteed to be persisted between requests, so relying on in-memory sessions is impossible. 

This package allows you to use the Cyclic DynamoDB table as an express.js session store.

## Installation
`npm install @cyclic.sh/session-store`
## Example usage

```js
const { CyclicSessionStore } = require("@cyclic.sh/session-store");

const options = {
  table: {
    name: process.env.CYCLIC_DB,
  }
};


app.use(
  session({
    store: new CyclicSessionStore(options),
    ...
  })
);
```

## Using the package locally
Copy the temporary credentials from the Cyclic dashboard and set them in the shell environment where your code will be running.

The following environment are required for use **on local**. 
```
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
```
These are automatically available when apps are deployed and must not be configured as environment variables in deployment.



## Options

```
{
  table: {
    name: process.env.CYCLIC_DB,
  },
  keepExpired: false, 
  touchInterval: 30000, // milliseconds (30 seconds)
  ttl: 86400000 // milliseconds (1 day)
};
```
> This store implements the [touch](https://github.com/expressjs/session#storetouchsid-session-callback) method to allow express-session configurations to use [resave](https://github.com/expressjs/session#resave): false.

`keepExpired` - (optional) (defaults to false). When set to false informs the store to remove from DynamoDB expired session rows when they are requested. When set to true the store will just ignores the expired rows and leave them in DynamoDB. This property does not guarantee that all expired sessions will be removed from DynamoDB, only the ones that receive requests after they expire.

`touchInterval` - defines how often requests should update the time to live of a session. This property is important to avoid unnecessary table writes. By default the interval allows express to touch a same session every 30 seconds. touchInterval = 0 will cause a touch on every request.

`ttl` - The time to live of the sessions can be controlled:
- **Using cookies with the cookie.maxAge property:**
If this property is set, the session cookie will be created with a fixed 'expires' attribute. After the specified time the session cookie will expire and a new session will be created even if the user is still active. To avoid that you need update the 'expires' attribute of the session cookie on every request by setting the rolling session property to true. This way every request will have a set-cookie response with the updated 'expires' attribute.
- **Using the TTL property (recommended)**
Using the ttl property implemented by this store the session time to live will be controlled by the server. The time to live will be refreshed based on the touchInterval property without the need to update cookies.

If both cookie.maxAge and ttl are informed, ttl takes precedence.

`table.name` - the name of the DynamoDB table the store will use. This is available on a Cyclic app's dashboard in the Database/Storage tab.

`table.hashKey` - (defaults to `pk`) The hash key of primary index of the DynamoDB table. In Cyclic apps, the table schema is pre-defined and this should be kept as default. 

`table.sortKey` - (defaults to `sk`) The sort key of primary index of the DynamoDB table. In Cyclic apps, the table schema is pre-defined and this should be kept as default. 

--------------
This package is adapted to be compatible with composite key tables using aws-sdk v3 from: https://www.npmjs.com/package/dynamodb-store
