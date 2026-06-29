import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function cartApiMockPlugin(): Plugin {
  let cartItems: CartItem[] | null = null

  const initItems = () => {
    if (cartItems) {
      return cartItems
    }
    const configDir = path.dirname(fileURLToPath(import.meta.url))
    const sourceFile = path.join(configDir, 'public', 'cart-items.json')
    const fileContent = readFileSync(sourceFile, 'utf-8')
    cartItems = JSON.parse(fileContent) as CartItem[]
    return cartItems
  }

  return {
    name: 'cart-api-mock',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/cart-items')) {
          next()
          return
        }

        const items = initItems()

        if (req.method === 'GET' && req.url === '/api/cart-items') {
          await delay(1200)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(items))
          return
        }

        const itemId = req.url.match(/^\/api\/cart-items\/([^/?]+)/)?.[1]
        if (!itemId) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid cart item route' }))
          return
        }

        if (req.method === 'PATCH') {
          let rawBody = ''
          for await (const chunk of req) {
            rawBody += chunk
          }
          const payload = JSON.parse(rawBody) as { quantity?: number }
          const item = items.find((entry) => entry.id === itemId)

          if (!item || !payload.quantity || payload.quantity < 1) {
            await delay(700)
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid quantity update request' }))
            return
          }

          item.quantity = Math.floor(payload.quantity)
          await delay(800)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ id: item.id, quantity: item.quantity }))
          return
        }

        if (req.method === 'DELETE') {
          const targetIndex = items.findIndex((entry) => entry.id === itemId)
          if (targetIndex === -1) {
            await delay(700)
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'Cart item not found' }))
            return
          }

          items.splice(targetIndex, 1)
          await delay(900)
          res.statusCode = 204
          res.end()
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cartApiMockPlugin()],
})
