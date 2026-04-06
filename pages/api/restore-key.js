import admin from 'firebase-admin';

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
  if (req.method === 'POST') {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    try {
      const doc = await db.collection('expired_keys').doc(key).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Key not found' });
      }

      const data = doc.data();
      // Add 24 hours grace period upon restoration
      data.expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      await db.collection('keys').doc(key).set(data); // Move back to active keys
      await db.collection('expired_keys').doc(key).delete(); // Remove from expired keys
      res.status(200).json({ message: 'Key restored successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to restore key' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}