export function getDate(): { date: string, time: string } {
  const time = new Date().toISOString()
  return { date: time.split('T')[0], time }
}

export async function getLocation(): Promise<string> {
  const res = await fetch('https://cloudflare-dns.com/dns-query', {
    method: 'OPTIONS',
  })

  const ray = res.headers.get('cf-ray')
  if (!ray) {
    throw new Error('Can\'t query location.')
  }

  return ray.split('-')[1]
}

export function avg(data: number[]): number {
  let sum = 0
  data.forEach(d => sum += d)
  return Math.round(sum / data.length)
}
