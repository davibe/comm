README
------

*WIP*

Simple microservice communication library based on 'amqp-as-promised'
- configuration based on env vars
- simple interface wrapping function, arguments and errors


### Example

Microservices below will connect to RabbitMQ at "amqp://localhost:5672//?heartbeat=10".

They can be launched using node 7 with --harmony option


#### service1.js

```javascript
const comm = require('comm')

comm.expose('service1', 'hi', async (name, surname) => {
  await new Promise(r => setTimeout(r, 1000))
  return { hi: `${name} ${surname}` }
})
```

#### service2.js

```javascript
const comm = require('comm')

const main = async () => {
  const result = await comm.call('service1', 'hi', 'Pluto', 'Brau')
  console.log(result) // -> { hi: "Pluto Brau"}
}

if (!process.parent) { main() }
```


### Tests

```bash
docker-compose stop -t1; docker-compose rm -f ; docker-compose build ; docker-compose up test
```
