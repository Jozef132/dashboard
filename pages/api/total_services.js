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
      const servicesSnapshot = await db.collection('services').get();
      const totalServices = servicesSnapshot.size; // ✅ Get the total count

      res.status(200).json({ totalServices });
    } catch (err) {
      console.error("API Error:", err);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
