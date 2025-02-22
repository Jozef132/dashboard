import admin from 'firebase-admin';

// Initialize Firebase
const serviceAccount = require('./cred.json'); // Adjust path if necessary
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const activeKeysSnapshot = await db.collection('keys').get();

      if (activeKeysSnapshot.empty) {
        return res.status(200).json([]); // Return empty array if no active keys
      }

      const activeKeys = activeKeysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(activeKeys);
    } catch (err) {
      console.error("API Error:", err);
      res.status(500).json({ error: 'Failed to fetch active keys' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
