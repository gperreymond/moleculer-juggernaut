const fse = require('fs-extra')
const watch = require('glob-watcher')
const parse = require('csv-parse/lib/sync')

module.exports = {
  name: 'source_file',
  settings: {
    id: 'my_id',
    delimiter: ','
  },
  actions: {
    readFile: {
      handler: async function (ctx) {
        try {
          this.logger.info(ctx.action.name, ctx.params)
          const settings = this.settings
          const broker = this.broker
          const { file } = ctx.params
          const content = await fse.readFile(file)
          const records = parse(content, {
            delimiter: settings.delimiter
          })
          records.map(record => {
            broker.broadcastLocal(`${settings.id}.broadcast`, {
              timestamp: new Date(),
              file,
              message: record.join(settings.delimiter)
            })
            return true
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
