const { v4: uuidv4 } = require('uuid')
const fse = require('fs-extra')
const YAML = require('yamljs')

const { name, version } = require('./package.json')
const { config: { file: configFilePath } } = require('./application.config')

module.exports = {
  nodeID: `node-${name}-${version}-${uuidv4()}`,
  logger: true,
  started: async (broker) => {
    // Load configFilePath
    const configFilePathExists = await fse.pathExists(configFilePath)
    if (configFilePathExists === false) {
      broker.logger.error('configFilePath not exits')
      process.exit(1)
    }
    broker.logger.info('configFilePath need to be loaded')
    const { sources } = YAML.load(configFilePath)
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
    return true
  }
}
