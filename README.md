# cyclic-session

Express middleware that stores sessions in DynamoDB tables for Cyclic apps.

Adapted from: https://www.npmjs.com/package/dynamodb-store

## Example usage

```js
const dynamoOpts = {
  table: {
    name: process.env.CYCLIC_DB,
    hashKey: 'pk',
    hashPrefix: 'sid_',
    sortKey: 'sk',
    create: false
  },
  // dynamoConfig: {
  //   endpoint: process.env.AWS_DYNAMO_ENDPOINT,
  // },
  keepExpired: false,
  touchInterval: oneHourMs,
  ttl: oneDayMs
}

// console.log(typeof DynamoDBStore)

app.set('trust-proxy', 1)
app.use(session({
  store: new DynamoDBStore(dynamoOpts),
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
