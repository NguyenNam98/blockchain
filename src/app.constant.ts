export const ENV_LOCAL = "develop"

export const DATABASE_NAMES = {
  MASTER: {
    DB: 'master',
    NAME: 'DB_master',
  },
}

export const RATE_LIMIT_DEFAULT = {
  LIMIT: process.env.ENV == 'production' ? 100 : 500,
  TTL: 15 * 60, // 15 minutes
}