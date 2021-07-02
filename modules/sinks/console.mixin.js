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
          console.log(JSON.stringify(ctx.params))
          return true
        } catch (e) {
          this.logger.error(ctx.action.name, e.message)
          return false
        }
      }
    }
  },
  async created () {
    try {
      const settings = this.settings
      const logger = this.logger
      logger.info('sink_console loading...', settings)
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
