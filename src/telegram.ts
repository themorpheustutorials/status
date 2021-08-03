export async function notifyIncident(service: string, namespace: string) {
  const token = process.env.TELEGRAM_TOKEN
  const ids: string[] = JSON.parse(process.env.TELEGRAM_CHAT_IDS)

  const requests = ids.map(id =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, createBody(id, service, namespace)),
  )

  await Promise.all(requests)
}

function createBody(chatId: string, service: string, namespace: string): RequestInit {
  return {
    body: JSON.stringify({
      chat_id: chatId,
      text: `Service ${service} has an incident. Namespace: ${namespace}`,
      disable_notification: true,
    }),
  }
}
