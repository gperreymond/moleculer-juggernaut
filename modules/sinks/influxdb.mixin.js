const Influx = require('influx')

module.exports = {
  name: 'sink_influxdb',
  settings: {
    id: 'my_id',
    hostname: 'localhost',
    username: 'admin',
    password: 'changeme',
    port: 443,
    protocol: 'https',
    database: 'juggernaut',
    schema: []
  },
  actions: {
    execute: {
      handler: async function (ctx) {
        try {
          this.logger.info(ctx.action.name, ctx.params)
          await this.$influx.writePoints([ctx.params])
          return true
        } catch (e) {
          this.logger.error(ctx.action.name, e.message)
          console.log(e.message)
          return false
        }
      }
    }
  },
  async created () {
    try {
      const settings = this.settings
      const logger = this.logger
      logger.info('sink_influxdb loading...', settings)
      console.log(Influx)
      this.$influx = new Influx.InfluxDB({
        host: settings.hostname,
        username: settings.username,
        password: settings.password,
        database: settings.database
      })
      await this.$influx.createDatabase(settings.database)
      logger.info(`sink_influxdb started on ${settings.hostname}:${settings.port}`)
      return true
    } catch (e) {
      this.logger.error(e.message)
      console.log(e.message)
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
