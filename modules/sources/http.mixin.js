const Hapi = require('@hapi/hapi')

module.exports = {
  name: 'sink_http',
  settings: {
    id: 'my_id',
    hostname: 'localhost',
    port: 8080,
    auth: false
  },
  actions: {
    publish: {
      async handler (ctx) {
        return true
      }
    }
  },
  async created () {
    try {
      const broker = this.broker
      const settings = this.settings
      const logger = this.logger
      logger.info('sink_http loading...', settings)
      const server = Hapi.server({
        port: settings.port,
        host: settings.host
      })
      server.route({
        method: 'POST',
        path: '/',
        handler: (request) => {
          broker.broadcast(settings.id, request.payload)
          return { broadcast: true }
        }
      })
      await server.start()
      logger.info('sink_http started on', server.info.uri)
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
