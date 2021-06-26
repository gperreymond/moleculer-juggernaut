const winston = require('winston')

module.exports = {
  name: 'sink_console',
  settings: {
    id: 'my_id'
  },
  actions: {
    execute: {
      handler: async function (ctx) {
        try {
          this.logger.info(ctx.action.name, ctx.params)
          this.$sink.info({
            timestamp: ctx.params.timestamp || new Date(),
            ...ctx.params
          })
          return { success: true }
        } catch (e) {
          this.logger.error(ctx.action.name, e.message)
          return { success: false }
        }
      }
    }
  },
  async created () {
    try {
      const logger = this.logger
      logger.info('sink_console loading...')
      this.$sink = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [
          new winston.transports.Console()
        ]
      })
      return true
    } catch (e) {
      this.logger.error(e.message)
      throw e
    }
  },
  async started () {
    return true
  },
  async stopped () {
    return true
  }
}
