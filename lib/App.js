import http from 'http'
import path from 'path'

import requestManager from './requestManager.js'

const port = process.env.PORT || 3000

export default function App(config) {
  const server = http.createServer((req, res) => {
    if (rewrite(req, res) || invalid(req, res)) {
      return res.end()
    }

    handleRequest(req, res)
  })
  server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
  })

  server.listen(port, () => {
    console.log(`SmartES is running at ${port}`)
  })

  function rewrite(req, res) {
    const [pathname, search] = req.url.split('?')
    if (search) {
      res.writeHead(301, {Location: pathname})
      return true
    }

    const newPath = path.normalize(pathname)
    if (newPath !== pathname) {
      res.writeHead(301, {Location: newPath})
      return true
    }
  }

  function invalid(req, res) {
    const parts = req.url.split('/')

    if (parts.length < 3) {
      res.writeHead(404, {'Content-Type': 'text/text'})
      res.write('404 Not found.')
      return true
    }
  }

  async function handleRequest(req, res) {
    const [_, treeish, ...rest] = req.url.split('/')

    try {
      const [status, headers, body] = await requestManager(
        config,
        treeish,
        rest.join('/')
      )
      res.writeHead(status, headers)
      res.end(body)
    } catch (e) {
      res.writeHead(500, {'Content-Type': 'text/text'})
      res.end(e.stack)
    }
  }
}