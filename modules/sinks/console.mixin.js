const winston = require('winston')
const Transport = require('winston-transport')

class ContsoleTransport extends Transport {
  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })
    callback()
  }
}

const transport = new ContsoleTransport()
transport.on('logged', (info) => {
  delete info.level
  console.log(JSON.stringify(info))
})

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
      const settings = this.settings
      const logger = this.logger
      logger.info('sink_console loading...', settings)
      this.$sink = winston.createLogger({
        format: winston.format.json(),
        transports: [transport]
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
