import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
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
  const { email, password, discordUsername, phoneNumber, expirationDate, serviceCategory } = req.body;

  if (!email || !expirationDate || !serviceCategory) {
    return res.status(400).json({ error: 'Email, expiration date, and service category are required' });
  }

  try {
    const referenceNumber = uuidv4(); 

    // Fetch Discord Webhook URL from settings
    let webhookUrl = null;
    const settingsDoc = await db.collection('settings').doc('discord').get();
    if (settingsDoc.exists && settingsDoc.data().webhookUrl) {
      webhookUrl = settingsDoc.data().webhookUrl;
    }

    // Save the subscription to Firestore
    await db.collection('keys').doc(referenceNumber).set({
      email,
      password: password || '',
      discordUsername: discordUsername || '',
      phoneNumber: phoneNumber || '',
      serviceCategory,
      valid: true,
      expirationDate: new Date(expirationDate).toISOString(),
    });

    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, {
          embeds: [{
            title: "🎉 New Subscription Created",
            color: 5763719, // Green
            fields: [
              { name: "📋 Reference Number", value: `\`${referenceNumber}\``, inline: false },
              { name: "📧 Email", value: email || "Unknown", inline: true },
              { name: "🎮 Discord", value: discordUsername || "None", inline: true },
              { name: "📞 Phone", value: phoneNumber || "None", inline: true },
              { name: "📁 Service Category", value: serviceCategory || "Unknown", inline: true }
            ],
            footer: {
              text: "PC Engineer Dashboard"
            },
            timestamp: new Date().toISOString()
          }]
        });
      } catch (discordErr) {
        console.error("Failed to send webhook for new subscription", discordErr.message);
      }
    }

    res.status(200).json({ key: referenceNumber });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate subscription' });
  }
}