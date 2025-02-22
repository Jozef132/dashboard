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
    const { serviceName } = req.body;

    if (!serviceName) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    try {
      // Save the new service to Firestore
      await db.collection('services').doc(serviceName).set({
        name: serviceName,
      });

      res.status(200).json({ message: 'Service added successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add service' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}