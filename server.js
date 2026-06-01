const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const app = next({ dev: false, hostname: '0.0.0.0', port: 3000 })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true))
  }).listen(3000, () => {
    console.log('> Ready on http://0.0.0.0:3000')
  })
})
