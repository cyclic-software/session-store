# @cyclic.sh/session-store

Express middleware that stores sessions in DynamoDB tables for Cyclic apps. Adapted from: https://www.npmjs.com/package/dynamodb-store


[![Discord](https://img.shields.io/discord/895292239633338380)](https://discord.cyclic.sh/support) [![CI](https://github.com/cyclic-software/session-store/actions/workflows/run_tests.yaml/badge.svg)](https://github.com/cyclic-software/session-store/actions/workflows/run_tests.yaml) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

[![npm (scoped)](https://img.shields.io/npm/v/@cyclic.sh/session-store)](https://www.npmjs.com/package/@cyclic.sh/session-store) ![node-current (scoped)](https://img.shields.io/node/v/@cyclic.sh/session-store) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@cyclic.sh/session-store)



## Example usage

`npm install @cyclic.sh/session-store`

```js
const {CyclicSessionStore} = require('@cyclic.sh/session-store')

const dynamoOpts = {
  table: {
    name: process.env.CYCLIC_DB,
  },
  keepExpired: false,
  touchInterval: oneHourMs,
  ttl: oneDayMs
}

app.set('trust-proxy', 1)
app.use(session({
  store: new CyclicSessionStore(dynamoOpts),
  secret: process.env.SESSION_SECRET || 'THIS-IS-NOT-A-SECRET',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: 'auto', // (process.env.NODE_ENV != 'development'),
    maxAge: oneDayMs
  }
  // unset: "destroy"
}))
```
