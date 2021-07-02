/* eslint no-eval: "off" */

const { filter } = require('lodash')

module.exports = {
  name: 'transform_remap',
  settings: {
    id: 'my_id'
  },
  methods: {
    remap (line, data) {
      try {
        eval(line)
        return data
      } catch (e) {
        return data
      }
    }
  },
  actions: {
    execute: {
      handler: async function (ctx) {
        try {
          this.logger.info(ctx.action.name, ctx.params)
          const broker = ctx.broker
          const settings = this.settings
          // Run the remapping
          const lines = filter(settings.source.split('\n'), o => o !== '')
          if (lines.length > 0) {
            do {
              const line = lines.shift()
              ctx.params = this.remap(line, ctx.params)
            } while (lines.length > 0)
          }
          // Brodcasting
          broker.broadcastLocal(`${settings.id}.broadcast`, ctx.params)
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
      logger.info('transform_remap loading...', settings)
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
    await this.$server.stop()
    return true
  }
}
