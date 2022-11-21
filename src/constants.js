// @flow

// defaults
const DEFAULT_TABLE_NAME = 'sessions'
const DEFAULT_HASH_KEY = 'pk'
const DEFAULT_SORT_KEY = 'sk'
const DEFAULT_TTL = 86400000 // 1 day
const DEFAULT_TOUCH_INTERVAL = 30000 // 30 seconds
const DEFAULT_KEEP_EXPIRED_POLICY = false
const DEFAULT_CALLBACK = (err) => {
  if (err) {
    throw err
  }
}

// aws

module.exports = {
  DEFAULT_TABLE_NAME,
  DEFAULT_HASH_KEY,
  DEFAULT_SORT_KEY,
  DEFAULT_TTL,
  DEFAULT_TOUCH_INTERVAL,
  DEFAULT_KEEP_EXPIRED_POLICY,
  DEFAULT_CALLBACK,
}
