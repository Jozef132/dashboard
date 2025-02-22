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
      const services = [];
      servicesSnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      res.status(200).json(services);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}