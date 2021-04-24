import { handleRequest } from './handler'
import { Namespace } from './data'
import { handleScheduled } from './cron'

export const NAMESPACES: Namespace[] = [
  {
    id: 'cryptic',
    name: 'Cryptic',
    services: [
      { // TODO: add websocket support
        id: 'ws',
        name: 'WebSocket',
        description: '',
        url: 'https://ws.cryptic-game.net',
        method: 'GET',
        status: 400,
      },
      {
        id: 'rest-api',
        name: 'Rest Api',
        description: '',
        url: 'https://server.cryptic-game.net/status',
        method: 'GET',
        status: 200,
      },
      {
        id: 'frontend',
        name: 'Frontend',
        description: '',
        url: 'https://play.cryptic-game.net',
        method: 'GET',
        status: 200,
      },
      {
        id: 'website',
        name: 'Website',
        description: '',
        url: 'https://www.cryptic-game.net',
        method: 'GET',
        status: 200,
      },
      {
        id: 'wiki',
        name: 'Wiki',
        description: '',
        url: 'https://wiki.cryptic-game.net',
        method: 'GET',
        status: 200,
      },
    ],
  },
  {
    id: 'morpheus',
    name: 'Morpheus',
    services: [
      {
        id: 'website',
        name: 'Website',
        description: '',
        url: 'https://www.the-morpheus.de',
        method: 'GET',
        status: 200,
      },
      {
        id: 'id',
        name: 'MorphID',
        description: '',
        url: 'https://id.the-morpheus.de',
        method: 'GET',
        status: 200,
      },
      {
        id: 'jitsi',
        name: 'Jitsi',
        description: '',
        url: 'https://jitsi.the-morpheus.de',
        method: 'GET',
        status: 200,
      },
      {
        id: 'certificates',
        name: 'Certificates',
        description: '',
        url: 'https://certificates.the-morpheus.de',
        method: 'GET',
        status: 200,
      },
      {
        id: 'cc',
        name: 'Coding Challenges',
        description: '',
        url: 'https://cc.the-morpheus.de',
        method: 'GET',
        status: 200,
      },
      {
        id: 'element',
        name: 'Element',
        description: '',
        url: 'https://element.the-morpheus.de',
        method: 'GET',
        status: 200,
      },
      {
        id: 'matrix',
        name: 'Matrix',
        description: '',
        url: 'https://matrix.the-morpheus.de',
        method: 'GET',
        status: 200,
      },
      {
        id: 'md',
        name: 'CodiMD',
        description: '',
        url: 'https://md.the-morpheus.de',
        method: 'GET',
        status: 200,
      },
      {
        id: 'academy',
        name: 'The Morpheus Academy',
        description: '',
        url: 'https://the-morpheus.academy',
        method: 'GET',
        status: 200,
      },
    ],
  },
]

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled())
})
