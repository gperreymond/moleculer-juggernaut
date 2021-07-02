const RabbitmqBroker = require('rascal').BrokerAsPromised

module.exports = {
  name: 'sink_rabbitmq',
  settings: {
    id: 'my_id',
    hostname: 'localhost',
    port: 5672,
    username: 'admin',
    password: 'changeme'
  },
  actions: {
    execute: {
      handler: async function (ctx) {
        try {
          this.logger.info(ctx.action.name, ctx.params)
          const settings = this.settings
          await this.$rabbitmq.publish(settings.id, ctx.params)
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
      logger.info('sink_rabbitmq loading...', settings)
      // connection
      const connection = {
        slashes: true,
        protocol: 'amqp',
        hostname: settings.hostname,
        user: settings.username,
        password: settings.password,
        port: settings.port,
        options: {
          heartbeat: 5
        },
        socketOptions: {
          timeout: 10000
        }
      }
      // exchanges
      const exchanges = {}
      exchanges[`juggernaut.${settings.id}.fanout`] = {
        type: 'fanout',
        options: {
          durable: true
        }
      }
      // queues
      const queues = {}
      queues[`juggernaut.${settings.id}.queue`] = {
      }
      // bindings
      const bindings = {}
      bindings[`juggernaut.${settings.id}.binding`] = {
        source: `juggernaut.${settings.id}.fanout`,
        destination: `juggernaut.${settings.id}.queue`,
        destinationType: 'queue',
        bindingKey: [`juggernaut.${settings.id}.key`]
      }
      // publications
      const publications = {}
      publications[settings.id] = {
        vhost: settings.vhost,
        exchange: `juggernaut.${settings.id}.fanout`,
        routingKey: `juggernaut.${settings.id}.key`
      }
      // create the broker
      this.$rabbitmq = await RabbitmqBroker.create({
        vhosts: {
          '/': {
            connection,
            exchanges,
            queues,
            bindings,
            publications
          }
        }
      })
      logger.info(`sink_rabbitmq started on ${settings.hostname}:${settings.port}`)
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
