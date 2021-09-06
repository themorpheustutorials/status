import { NAMESPACES } from './index'
import { readData } from './kv'

const ORIGIN = '*'

export async function handleRequest(request: Request): Promise<Response> {
  const namespaceId = new URL(request.url).searchParams.get('namespace')
  if (!namespaceId) {
    return new Response('missing namespace id',
      { status: 400, headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': ORIGIN } })
  }

  const namespace = NAMESPACES.find(namespace => namespace.id == namespaceId)
  if (!namespace) {
    return new Response(`namespace with id ${namespaceId} not found`,
      { status: 404, headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': ORIGIN } })
  }

  namespace.services = namespace.services.filter(service => service.visible);
  namespace.services.forEach(service => {
    delete service.visible;
  });

  const data = {
    namespace: namespace,
    services: await readData(namespace),
  }

  return new Response(JSON.stringify(data),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN } })
}
