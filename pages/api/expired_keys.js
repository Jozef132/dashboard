import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const expiredKeysSnapshot = await db.collection('expired_keys').get();
      const expiredKeys = expiredKeysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).json(expiredKeys);
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Failed to fetch expired keys' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
