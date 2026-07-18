export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const token = '8432468154:AAE2o9LOHCioen1MAAcy3gjjf-PE6S34hrA';
  const chatId = '6493948562';
  
  const { name, email, service, budget, about } = req.body;

  const message = 
    '🍳 New project inquiry\n\n' +
    '👤 Name: ' + name + '\n' +
    '✉️ Email: ' + email + '\n' +
    '🛠️ Service: ' + service + '\n' +
    '💰 Budget: ' + budget + '\n\n' +
    '📝 About:\n' + about;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Telegram API error' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}