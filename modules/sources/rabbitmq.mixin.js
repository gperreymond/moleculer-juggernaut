const RabbitmqBroker = require('rascal').BrokerAsPromised

module.exports = {
  name: 'source_rabbitmq',
  settings: {
    id: 'my_id',
    hostname: 'localhost',
    port: 5672,
    username: 'admin',
    password: 'changeme',
    queue: 'nothing',
    prefetch: 1
  },
  async created () {
    try {
      const broker = this.broker
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
      // subscriptions
      const subscriptions = {
        juggernaut: {
          queue: settings.queue,
          prefetch: settings.prefetch
        }
      }
      // create the broker
      this.$rabbitmq = await RabbitmqBroker.create({
        vhosts: {
          '/': {
            connection,
            queues: [settings.queue],
            subscriptions
          }
        }
      })
      logger.info(`sink_rabbitmq started on ${settings.hostname}:${settings.port}`)
      const subscription = await this.$rabbitmq.subscribe('juggernaut')
      subscription.on('message', (message, content, ackOrNack) => {
        broker.broadcastLocal(`${settings.id}.broadcast`, {
          timestamp: new Date(),
          message: content
        })
        ackOrNack()
      }).on('error', (err) => {
        console.error('Subscriber error', err)
      }).on('redeliveries_exceeded', (err, message, ackOrNack) => {
        console.error('Redeliveries exceeded', err)
        ackOrNack(err)
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
