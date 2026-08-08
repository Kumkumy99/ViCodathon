import { BreethClient } from '@breeth/sdk'

const BREETH_API_KEY = process.env.BREETH_API_KEY

const client = BREETH_API_KEY
  ? new BreethClient({ apiKey: BREETH_API_KEY })
  : null

function ensureClient() {
  if (!client) {
    throw new Error('Breeth API key is not configured.')
  }
  return client
}

async function write({ text, intent, entities }) {
  if (!client) {
    return null
  }

  return client.request({
    method: 'POST',
    path: '/v1/episodes',
    body: {
      project: 'ai-interview-agent',
      episode: {
        text,
        intent,
        entities,
      },
    },
  })
}

async function search({ query, limit = 3 }) {
  if (!client) {
    return null
  }

  return client.request({
    method: 'POST',
    path: '/v1/search',
    body: {
      project: 'ai-interview-agent',
      query,
      limit,
    },
  })
}

export const breeth = {
  write,
  search,
  get isEnabled() {
    return Boolean(client)
  },
  get client() {
    return ensureClient()
  },
}
