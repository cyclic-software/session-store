// @flow

// defaults
const DEFAULT_TABLE_NAME = 'sessions'
const DEFAULT_TABLE_CREATE = true
const DEFAULT_HASH_KEY = 'sessionId'
const DEFAULT_SORT_KEY = undefined
const DEFAULT_HASH_PREFIX = 'sess:'
const DEFAULT_RCU = 5
const DEFAULT_WCU = 5
const DEFAULT_TTL = 86400000 // 1 day
const DEFAULT_TOUCH_INTERVAL = 30000 // 30 seconds
const DEFAULT_KEEP_EXPIRED_POLICY = false
const DEFAULT_CALLBACK = (err) => {
  if (err) {
    throw err
  }
}

// aws
const API_VERSION = '2012-08-10'

module.exports = {
  DEFAULT_TABLE_NAME,
  DEFAULT_HASH_KEY,
  DEFAULT_SORT_KEY,
  DEFAULT_RCU,
  DEFAULT_WCU,
  DEFAULT_TTL,
  DEFAULT_TOUCH_INTERVAL,
  DEFAULT_KEEP_EXPIRED_POLICY,
  DEFAULT_CALLBACK,
  API_VERSION
}
