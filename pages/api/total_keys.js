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
  if (req.method === 'GET') {
    try {
      // Fetch total keys
      const keysSnapshot = await db.collection('keys').get();
      const totalKeys = keysSnapshot.size; // Total number of keys

      // Fetch expired keys
      const expiredKeysSnapshot = await db.collection('expired_keys').get();
      const totalExpiredKeys = expiredKeysSnapshot.size; // Total expired keys

      const total = totalKeys + totalExpiredKeys;

      res.status(200).json({ total });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch keys data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
