export async function notifyIncident(service: string, namespace: string) {
  const telegramToken = TELEGRAM_TOKEN
  const telegramIds: string[] = JSON.parse(TELEGRAM_CHAT_IDS)
  const discordWebhooks: string[] = JSON.parse(DISCORD_WEBHOOKS)

  const message = `${namespace}: ${service} has an incident`

  const discordBody = createDiscordBody(message)

  const requests = [
    ...telegramIds.map(id => fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, createTelegramBody(id, message))),
    ...discordWebhooks.map(hook => fetch(hook, discordBody)),
  ]

  await Promise.all(requests)
}

export async function resolveIncident(service: string, namespace: string) {
  const telegramToken = TELEGRAM_TOKEN
  const telegramIds: string[] = JSON.parse(TELEGRAM_CHAT_IDS)
  const discordWebhooks: string[] = JSON.parse(DISCORD_WEBHOOKS)

  const message = `${namespace}: ${service} no longer has an incident`

  const discordBody = createDiscordBody(message)

  const requests = [
    ...telegramIds.map(id => fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, createTelegramBody(id, message))),
    ...discordWebhooks.map(hook => fetch(hook, discordBody)),
  ]

  await Promise.all(requests)
}

function createTelegramBody(chatId: string, message: string): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_notification: true,
    }),
  }
}

function createDiscordBody(message: string): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  }
}
