const amqp = require('amqp-as-promised')
const serializeError = require('serialize-error')


const conf = {
  connection: {
    url: process.env.RABBITMQ_URL || "amqp://localhost:5672//?heartbeat=10"
  },
  logLevel: process.env.RABBITMQ_LOG_LEVEL || 'warn',
  rpc: {
    timeout: process.env.RABBITMQ_TIMEOUT || 5000
  }
}

const amqpc = amqp(conf)


const exchangeName = 'myexchange'


const defaultOptions = { ack: true, prefetchCount: 1 }


const expose = (serviceName, methodName, method, options) =>
  amqpc.serve(
    exchangeName,
    `${serviceName}.${methodName}`,
    Object.assign({}, defaultOptions, options),
    async (msg, headers, del) => {
      try {
        return await method(...msg)
      } catch (e) {
        console.log(
          `comm.ERROR in ${serviceName}.${methodName}`,
          e,
          (e.stack ? e.stack.split('\n') : '')
        )
        return { __error__: serializeError(e) }
      }
    }
  )


const call = async (serviceName, methodName, ...args) => {
  const res = await amqpc.rpc(
    exchangeName,
    `${serviceName}.${methodName}`,
    args
  )
  if (res.__error__) { throw res.__error__ }
  return res
}


const activateGracefulShutdown = () => {
  const gracefulShutdown = async (opts) => {
    console.log('shutting down')
    await amqpc.shutdown()
    process.exit(0)
    // if not connected amqpc hangs .shutdown() indefinitely, so..
    await new Promise(res => setTimeout(res, 2000))
    process.exit(0)
  }

  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
}


module.exports = { expose, call, activateGracefulShutdown }
