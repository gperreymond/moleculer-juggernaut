const { v4: uuidv4 } = require('uuid')
const fse = require('fs-extra')
const YAML = require('yamljs')

const { name, version } = require('./package.json')
const { config: { file: configFilePath } } = require('./application.config')

module.exports = {
  nodeID: `node-${name}-${version}-${uuidv4()}`,
  logger: true,
  started: async (broker) => {
    const configFilePathExists = await fse.pathExists(configFilePath)
    if (configFilePathExists === false) {
      broker.logger.error('configFilePath not exits')
      process.exit(1)
    }
    broker.logger.info('configFilePath need to be loaded')
    const config = YAML.load(configFilePath)
    console.log(config)
    broker.createService({
      name: 'math',
      actions: {
        add (ctx) {
          return Number(ctx.params.a) + Number(ctx.params.b)
        }
      }
    })
    return true
  }
}
