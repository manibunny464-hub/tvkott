export async function sendComingSoonPush({ title, body, imageUrl, userIds = [] }) {
  if (!process.env.FCM_SERVER_KEY) {
    return {
      sent: false,
      provider: 'fcm',
      message: 'FCM_SERVER_KEY is not configured',
      userCount: userIds.length,
    };
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registration_ids: userIds,
      notification: { title, body, image: imageUrl },
      data: { type: 'coming-soon' },
    }),
  });

  return {
    sent: response.ok,
    provider: 'fcm',
    status: response.status,
    userCount: userIds.length,
  };
}
