// @flow
const { Store } = require('express-session')
const AWS = require('aws-sdk'); // eslint-disable-line
const {
  DEFAULT_TABLE_NAME,
  DEFAULT_RCU,
  DEFAULT_WCU,
  DEFAULT_CALLBACK,
  DEFAULT_HASH_KEY,
  DEFAULT_HASH_PREFIX,
  DEFAULT_TTL,
  DEFAULT_TOUCH_INTERVAL,
  DEFAULT_KEEP_EXPIRED_POLICY,
  API_VERSION
} = require('./constants')
const { toSecondsEpoch, debug, isExpired } = require('./util')

/**
 * Express.js session store for DynamoDB.
 */
class DynamoDBStore extends Store {
  /**
   * Constructor.
   * @param  {Object} options                Store
   * @param  {Function} callback Optional callback for table creation.
   */
  constructor (options = {}, callback = DEFAULT_CALLBACK) {
    super()
    debug('Initializing store', options)
    // debug('AWS sdk: ', AWS);

    this.setOptionsAsInstanceAttributes(options)

    const dynamoConfig = options.dynamoConfig || {}

    // dynamodb client configuration
    this.dynamoService = new AWS.DynamoDB({
      ...dynamoConfig,
      apiVersion: API_VERSION
    })
    this.documentClient = new AWS.DynamoDB.DocumentClient({
      service: this.dynamoService
    })

    // creates the table if necessary
    this.createTableIfDontExists(callback)
  }

  /**
   * Saves the informed store options as instance attributes.
   * @param {Object} options Store options.
   */
  setOptionsAsInstanceAttributes (options) {
    const {
      table = {},
      touchInterval = DEFAULT_TOUCH_INTERVAL,
      ttl,
      keepExpired = DEFAULT_KEEP_EXPIRED_POLICY
    } = options

    const {
      name = DEFAULT_TABLE_NAME,
      create = DEFAULT_TABLE_CREATE,
      hashPrefix = DEFAULT_HASH_PREFIX,
      hashKey = DEFAULT_HASH_KEY,
      sortKey = DEFAULT_SORT_KEY,
      readCapacityUnits = DEFAULT_RCU,
      writeCapacityUnits = DEFAULT_WCU
    } = table

    this.tableName = name
    this.tableCreate = create
    this.hashPrefix = hashPrefix
    this.hashKey = hashKey
    this.sortKey = sortKey
    this.readCapacityUnits = Number(readCapacityUnits)
    this.writeCapacityUnits = Number(writeCapacityUnits)

    this.touchInterval = touchInterval
    this.ttl = ttl
    this.keepExpired = keepExpired

    this.keySchema = [{ AttributeName: this.hashKey, KeyType: 'HASH' }]
    this.attributeDefinitions = [{ AttributeName: this.hashKey, AttributeType: 'S' }]
    if (this.sortKey) {
      this.keySchema.push({ AttributeName: this.sortKey, KeyType: 'RANGE' })
      this.attributeDefinitions.push({ AttributeName: this.sortKey, AttributeType: 'S' })
    }

    console.error(this)
  }

  /**
   * Checks if the sessions table already exists.
   */
  async isTableCreated () {
    try {
      // attempt to get details from a table
      const table = await this.dynamoService
        .describeTable({
          TableName: this.tableName
        })
        .promise()
      return true
    } catch (tableNotFoundError) {
      // Table does not exist
      // There is no error code on AWS error that we could match
      // so its safer to assume the error is because the table does not exist than
      // trying to match the message that could change
      return false
    }
  }

  /**
   * Creates the session table.
   */
  createTable () {
    const params = {
      TableName: this.tableName,
      KeySchema: this.keySchema,
      AttributeDefinitions: this.attributeDefinitions,
      ProvisionedThroughput: {
        ReadCapacityUnits: this.readCapacityUnits,
        WriteCapacityUnits: this.writeCapacityUnits
      }
    }
    return this.dynamoService.createTable(params).promise()
  }

  /**
   * Creates the session table. Does nothing if it already exists.
   * @param  {Function} callback Callback to be invoked at the end of the execution.
   */
  async createTableIfDontExists (callback) {
    if (!this.tableCreate) {
      debug('Config \'createTable\' specifies to not create table')
      callback()
      return
    }
    try {
      const exists = await this.isTableCreated()

      if (exists) {
        debug(`Table ${this.tableName} already exists`)
      } else {
        debug(`Creating table ${this.tableName}...`)
        await this.createTable()
      }

      callback()
    } catch (createTableError) {
      debug(`Error creating table ${this.tableName}`, createTableError)
      callback(createTableError)
    }
  }

  /**
   * Stores a session.
   * @param  {String}   sid      Session ID.
   * @param  {Object}   sess     The session object.
   * @param  {Function} callback Callback to be invoked at the end of the execution.
   */
  set (sid, sess, callback) {
    try {
      const sessionId = this.getSessionId(sid)
      const expires = this.getExpirationDate(sess)
      const params = {
        TableName: this.tableName,
        Item: {
          [this.hashKey]: sessionId,
          [this.sortKey]: sessionId,
          expires: toSecondsEpoch(expires),
          sess: {
            ...sess,
            updated: Date.now()
          }
        }
      }
      debug(`Saving session '${sid}'`, sess)
      this.documentClient.put(params, callback)
    } catch (err) {
      debug('Error saving session', {
        sid,
        sess,
        err
      })
      callback(err)
    }
  }

  /**
   * Retrieves a session from dynamo.
   * @param  {String}   sid      Session ID.
   * @param  {Function} callback Callback to be invoked at the end of the execution.
   */
  async get (sid, callback) {
    try {
      const sessionId = this.getSessionId(sid)
      const params = {
        TableName: this.tableName,
        Key: {
          [this.hashKey]: sessionId,
          [this.sortKey]: sessionId
        },
        ConsistentRead: true
      }

      const { Item: record } = await this.documentClient.get(params).promise()

      if (!record) {
        debug(`Session '${sid}' not found`)
        callback(null, null)
      } else if (isExpired(record.expires)) {
        this.handleExpiredSession(sid, callback)
      } else {
        debug(`Session '${sid}' found`, record.sess)
        callback(null, record.sess)
      }
    } catch (err) {
      debug(`Error getting session '${sid}'`, err)
      callback(err)
    }
  }

  /**
   * Deletes a session from dynamo.
   * @param  {String}   sid      Session ID.
   * @param  {Function} callback Callback to be invoked at the end of the execution.
   */
  async destroy (sid, callback = DEFAULT_CALLBACK) {
    try {
      const sessionId = this.getSessionId(sid)
      const params = {
        TableName: this.tableName,
        Key: {
          [this.hashKey]: sessionId,
          [this.sortKey]: sessionId
        }
      }
      await this.documentClient.delete(params).promise()
      debug(`Destroyed session '${sid}'`)
      callback(null, null)
    } catch (err) {
      debug(`Error destroying session '${sid}'`, err)
      callback(err)
    }
  }

  /**
   * Updates the expiration time of an existing session.
   * @param  {String}   sid      Session ID.
   * @param  {Object}   sess     The session object.
   * @param  {Function} callback Callback to be invoked at the end of the execution.
   */
  touch (sid, sess, callback) {
    try {
      if (!sess.updated || Number(sess.updated) + this.touchInterval <= Date.now()) {
        const sessionId = this.getSessionId(sid)
        const expires = this.getExpirationDate(sess)
        const params = {
          TableName: this.tableName,
          Key: {
            [this.hashKey]: sessionId,
            [this.sortKey]: sessionId
          },

          UpdateExpression: 'set expires = :e, sess.#up = :n',
          ExpressionAttributeNames: {
            '#up': 'updated'
          },
          ExpressionAttributeValues: {
            ':e': toSecondsEpoch(expires),
            ':n': Date.now()
          },
          ReturnValues: 'UPDATED_NEW'
        }
        debug(`Touching session '${sid}'`)
        this.documentClient.update(params, callback)
      } else {
        debug(`Skipping touch of session '${sid}'`)
        callback()
      }
    } catch (err) {
      debug(`Error touching session '${sid}'`, err)
      callback(err)
    }
  }

  /**
   * Handles get requests that found expired sessions.
   * @param  {String} sid Original session id.
   * @param  {Function} callback Callback to be invoked at the end of the execution.
   */
  async handleExpiredSession (sid, callback) {
    debug(`Found session '${sid}' but it is expired`)
    if (this.keepExpired) {
      callback(null, null)
    } else {
      this.destroy(sid, callback)
    }
  }

  /**
   * Builds the session ID foe storage.
   * @param  {String} sid Original session id.
   * @return {String}     Prefix + original session id.
   */
  getSessionId (sid) {
    return `${this.hashPrefix}${sid}`
  }

  /**
   * Calculates the session expiration date.
   * @param  {Object} sess The session object.
   * @return {Date}      the session expiration date.
   */
  getExpirationDate (sess) {
    let expirationDate = Date.now()
    if (this.ttl !== undefined) {
      expirationDate += this.ttl
    } else if (sess.cookie && Number.isInteger(sess.cookie.maxAge)) {
      expirationDate += sess.cookie.maxAge
    } else {
      expirationDate += DEFAULT_TTL
    }
    return new Date(expirationDate)
  }
}

module.exports = {
  DynamoDBStore
}
