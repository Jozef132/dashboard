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
  if (req.method === 'PUT') {
    const { id, username, days, serviceCategory } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Key ID is required' });
    }

    try {
      const updateData = {};
      if (username) updateData.username = username;
      if (days) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + parseInt(days));
        updateData.expirationDate = expirationDate.toISOString();
      }
      if (serviceCategory) updateData.serviceCategory = serviceCategory;

      await db.collection('keys').doc(id).update(updateData);

      res.status(200).json({ message: 'Key updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update key' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}