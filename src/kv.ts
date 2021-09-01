import { notifyIncident, resolveIncident } from './alert'
import { CronResponse, IncidentData, Namespace, ServiceData } from './data'
import { avg } from './utils'

const EXPIRE = 60 * 60 * 24 * 30 // 30 days

export async function readData(namespace: Namespace): Promise<ServiceData[]> {
  // @ts-ignore
  return await STATUS.get(namespace.id, { type: 'json' }) || []
}

async function writeData(namespace: Namespace, data: ServiceData[]) {
  // @ts-ignore
  await STATUS.put(namespace.id, JSON.stringify(data), { expirationTtl: EXPIRE })
}

export async function saveData(date: string, time: string, namespace: Namespace, data: CronResponse[]) {
  const services = await readData(namespace)

  for (let response of data) {
    const service = services.find(s => s.id === response.id)

    if (!service) {
      addService(time, services, response)
    }
    else {
      await updateService(namespace, time, service, response)
    }
  }

  clean(date, services)
  await writeData(namespace, services)
}

function addService(time: string, services: ServiceData[], response: CronResponse) {
  const incidents: IncidentData[] = response.ping.operational ? [] : [{ startTime: time }]

  services.push({
    id: response.id,
    ping: [response.ping],
    incidents: incidents,
  })
}

async function updateService(namespace: Namespace, time: string, service: ServiceData, response: CronResponse) {
  const ping = service.ping.find(p => p.date === response.ping.date && p.location === response.ping.location)

  if (!ping) {
    service.ping.push(response.ping)
  }
  else {
    if (!response.ping.lastPing) {
      throw new Error('Illegal argument: missing last ping!')
    }

    if (!ping.ping) {
      ping.ping = []
    }

    ping.ping.push(response.ping.lastPing)
    ping.lastPing = response.ping.lastPing
  }

  if (response.ping.operational) {
    const openIncident = service.incidents.find(p => !p.endTime)
    if (openIncident) {
      openIncident.endTime = time;
      await resolveIncident(service.id, namespace.name);
    }
  }
  else if (!service.incidents.find(i => !i.endTime)) {
    service.incidents.push({ startTime: time })
    await notifyIncident(service.id, namespace.name);
  }
}

function clean(date: string, services: ServiceData[]) {
  services.forEach(s => {
    s.ping.forEach(p => {
      if (!p.ping) return

      p.pingAvg = avg(p.ping)

      if (p.date !== date) {
        delete p.lastPing
        delete p.ping
      }
    })
  })
}
