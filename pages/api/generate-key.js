import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Initialize Firebase
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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