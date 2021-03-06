const Hapi = require('@hapi/hapi')

module.exports = {
  name: 'source_http',
  settings: {
    id: 'my_id',
    host: 'localhost',
    port: 8080
  },
  async created () {
    try {
      const broker = this.broker
      const settings = this.settings
      const logger = this.logger
      logger.info('source_http loading...', settings)
      this.$server = Hapi.server({
        port: settings.port,
        host: settings.host
      })
      this.$server.route({
        method: 'POST',
        path: '/',
        handler: (request) => {
          broker.broadcastLocal(`${settings.id}.broadcast`, {
            timestamp: new Date(),
            message: request.payload
          })
          return { success: true }
        }
      })
      await this.$server.start()
      logger.info(`source_http started on ${this.$server.info.uri}`)
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
