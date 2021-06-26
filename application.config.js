const nconf = require('nconf')
nconf.argv().env().file({ file: 'nconf.json' })

module.exports = {
  config: {
    file: nconf.get('APP_JUGGERNAUT_CONFIG_FILE')
  }
}
