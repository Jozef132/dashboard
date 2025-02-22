import admin from 'firebase-admin';

// Initialize Firebase
const serviceAccount = require('./cred.json'); // Adjust the path
if (!admin.apps.length) {
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