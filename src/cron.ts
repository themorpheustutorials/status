import { CronResponse, Namespace, ServiceQuery } from './data'
import { getDate, getLocation } from './utils'
import { saveData } from './kv'
import { NAMESPACES } from './index'

export async function handleScheduled() {
  const { date, time } = getDate()
  const location = await getLocation()

  for (let namespace of NAMESPACES) {
    await processNamespace(date, time, location, namespace)
  }
}

async function processNamespace(
  date: string,
  time: string,
  location: string,
  namespace: Namespace,
) {
  const newData = []

  for (let service of namespace.services) {
    newData.push(await processDomain(date, location, service))
  }

  return saveData(date, time, namespace, newData)
}

async function processDomain(
  date: string,
  location: string,
  service: ServiceQuery,
): Promise<CronResponse> {
  const init: RequestInitializerDict = {
    method: service.method,
    redirect: 'manual',
  }

  const requestStart = Date.now()
  let response
  try {
    response = await timeoutPromise(fetch(service.url, init), 10000)
  }
  catch (e) {
  }

  const ping = Math.round(Date.now() - requestStart)

  const operational = response?.status == service.status

  return {
    id: service.id,
    ping: { date, operational, lastPing: ping, location },
  }
}

function timeoutPromise<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(), timeout)
    promise.then(resolve, reject).then(() => clearTimeout(id))
  })
}
