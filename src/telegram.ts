export async function notifyIncident(service: string, namespace: string) {
  const token = TELEGRAM_TOKEN
  const ids: string[] = JSON.parse(TELEGRAM_CHAT_IDS)

  const requests = ids.map(id =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, createBody(id, service, namespace)),
  )

  await Promise.all(requests)
}

function createBody(chatId: string, service: string, namespace: string): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `${namespace}: ${service} has an incident`,
      disable_notification: true,
    }),
  }
}
