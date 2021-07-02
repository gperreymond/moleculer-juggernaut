const { v4: uuidv4 } = require('uuid')
const fse = require('fs-extra')
const YAML = require('yamljs')

const { name, version } = require('./package.json')
const { config: { file: configFilePath } } = require('./application.config')

module.exports = {
  nodeID: `node-${name}-${version}-${uuidv4()}`,
  logger: false,
  started: async (broker) => {
    // Load configFilePath
    const configFilePathExists = await fse.pathExists(configFilePath)
    if (configFilePathExists === false) {
      broker.logger.error('configFilePath not exits')
      process.exit(1)
    }
    broker.logger.info('configFilePath need to be loaded')
    const { sources, transforms, sinks } = YAML.load(configFilePath)
    // Create sources for configFilePath
    const sourcesKeys = Object.keys(sources)
    sourcesKeys.map(key => {
      broker.createService({
        name: key,
        mixins: [require(`./modules/sources/${sources[key].type}.mixin`)],
        settings: {
          id: key,
          ...sources[key]
        }
      })
      return true
    })
    // Create transforms for configFilePath
    const transformsKeys = Object.keys(transforms)
    transformsKeys.map(key => {
      const events = {}
      transforms[key].inputs.map(name => {
        events[`${name}.broadcast`] = function (ctx) { ctx.broker.call(`${key}.execute`, ctx.params) }
        return true
      })
      broker.createService({
        name: key,
        mixins: [require(`./modules/transforms/${transforms[key].type}.mixin`)],
        settings: {
          id: key,
          ...transforms[key]
        },
        events
      })
      return true
    })
    // Create sinks for configFilePath
    const sinksKeys = Object.keys(sinks)
    sinksKeys.map(key => {
      const events = {}
      sinks[key].inputs.map(name => {
        events[`${name}.broadcast`] = function (ctx) { ctx.broker.call(`${key}.execute`, ctx.params) }
        return true
      })
      broker.createService({
        name: key,
        mixins: [require(`./modules/sinks/${sinks[key].type}.mixin`)],
        settings: {
          id: key,
          ...sinks[key]
        },
        events
      })
      return true
    })
    return true
  }
}
