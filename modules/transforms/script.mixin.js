/* eslint no-eval: "off" */

module.exports = {
  name: 'transform_script',
  settings: {
    id: 'my_id'
  },
  methods: {
    script (source, data) {
      try {
        eval(source)
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
          // Run the script
          ctx.params = this.script(settings.source, ctx.params)
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
      logger.info('transform_script loading...', settings)
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
