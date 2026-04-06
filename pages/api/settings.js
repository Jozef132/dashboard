import admin from 'firebase-admin';

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
  if (req.method === 'GET') {
    try {
      const doc = await db.collection('settings').doc('discord').get();
      if (!doc.exists) {
        return res.status(200).json({ webhookUrl: '', webhookUrlExpiration: '' });
      }
      return res.status(200).json(doc.data());
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  } else if (req.method === 'POST') {
    try {
      const { webhookUrl, webhookUrlExpiration } = req.body;
      const dataToSave = {};
      if (webhookUrl !== undefined) dataToSave.webhookUrl = webhookUrl;
      if (webhookUrlExpiration !== undefined) dataToSave.webhookUrlExpiration = webhookUrlExpiration;
      
      await db.collection('settings').doc('discord').set(dataToSave, { merge: true });
      return res.status(200).json({ message: 'Settings saved successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save settings' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
