module.exports = {
  name: 'sink_http',
  settings: {
    sink_http: {
      id: 'my_id',
      hostname: 'localhost',
      port: 8080,
      auth: false
    }
  },
  async created () {
    try {
      const { name } = this.params
      console.log(name)
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
