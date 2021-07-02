const fse = require('fs-extra')
const watch = require('glob-watcher')

async function readStreamAsync (broker, file, settings) {
  console.log(file, settings)
  return new Promise(resolve => {
    const stream = fse.createReadStream(file, { encoding: 'utf8' })
    stream.on('data', data => {
      const lines = data.split(/\n/)
      lines.map(line => {
        if (line !== '') {
          broker.broadcastLocal(`${settings.id}.broadcast`, {
            timestamp: new Date(),
            file,
            message: line
          })
        }
        return true
      })
    })
    stream.on('close', () => {
      resolve()
    })
  })
}

module.exports = {
  name: 'source_file',
  settings: {
    id: 'my_id'
  },
  actions: {
    readFile: {
      handler: async function (ctx) {
        try {
          this.logger.info(ctx.action.name, ctx.params)
          const { file } = ctx.params
          await readStreamAsync(ctx.broker, file, this.settings)
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
      const settings = this.settings
      logger.info('source_file loading...', settings)
      this.$wp = watch(settings.include, function (done) {
        done()
      })
      return true
    } catch (e) {
      this.logger.error(e.message)
      throw e
    }
  },
  async started () {
    const broker = this.broker
    const settings = this.settings
    this.$wp.on('change', function (file) {
      // console.log('change', file)
    })
    this.$wp.on('add', async function (file) {
      await broker.call(`${settings.id}.readFile`, { file })
    })
    return true
  },
  async stopped () {
    return true
  }
}
