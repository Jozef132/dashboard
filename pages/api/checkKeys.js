import admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase
if (!admin.apps.length) {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAINL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    const keysSnapshot = await db.collection('keys').get();
    if (keysSnapshot.empty) {
      return res.status(200).json({ message: 'No active keys found' });
    }

    // Fetch Discord Webhook URL from settings
    let webhookUrl = null;
    const settingsDoc = await db.collection('settings').doc('discord').get();
    if (settingsDoc.exists && settingsDoc.data().webhookUrlExpiration) {
      webhookUrl = settingsDoc.data().webhookUrlExpiration;
    }

    const now = new Date();
    let updatedKeys = [];

    for (const doc of keysSnapshot.docs) {
      const data = doc.data();
      const expirationDate = new Date(data.expirationDate);

      if (expirationDate <= now) {
        // Move expired key to `expired_keys` collection
        await db.collection('expired_keys').doc(doc.id).set(data);
        await db.collection('keys').doc(doc.id).delete(); // Remove from active keys

        updatedKeys.push({ key: doc.id, ...data });

        // Send to Discord if webhook exists
        if (webhookUrl) {
          try {
            await axios.post(webhookUrl, {
              embeds: [{
                title: "⚠️ Subscription Expired",
                color: 15548997, // Red color
                fields: [
                  { name: "🔑 Reference Number", value: `\`${doc.id}\``, inline: false },
                  { name: "📧 Email", value: data.email || "Unknown", inline: true },
                  { name: "🎮 Discord", value: data.discordUsername || "None", inline: true },
                  { name: "📞 Phone", value: data.phoneNumber || "None", inline: true },
                  { name: "📁 Service Category", value: data.serviceCategory || "Unknown", inline: true }
                ],
                footer: {
                  text: "PC Engineer Dashboard"
                },
                timestamp: new Date().toISOString()
              }]
            });
          } catch (discordErr) {
            console.error("Failed to send webhook for key", doc.id, discordErr.message);
          }
        }
      }
    }

    res.status(200).json({
      message: 'Key check completed',
      updatedKeys,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
