const assert = require('assert')
const comm = require('../src/index')


class CustomError extends Error {
  constructor(...args) {
    super(...args)
    this.name = this.constructor.name
    this.attribute = "custom-attribute"
  }
}


describe('things should work :)', () => {

  // microservice1

  before(async () => {
    await comm.expose('testservice', 'testmethod', async (args) => {
      return { ok: true }
    })
    await comm.expose('testservice', 'testmethodfail', async (args) => {
      throw new CustomError('some custom error')
    })
  })

  // microservice2

  it('will call remote method', async () => {
    const result = await comm.call('testservice', 'testmethod', 'foo', 'bar')
    assert.equal(result.ok, true)
  })

  it('will call remotely failing method', async () => {
    let result = null
    try {
      await comm.call('testservice', 'testmethodfail', 'foo', 'bar')
    } catch (e) {
      result = e
    }
    assert.equal(result.name, 'CustomError')
    assert.equal(result.attribute, 'custom-attribute')
    assert.equal(result.message, 'some custom error')
  })

  after(() => { process.exit(0) })

})
