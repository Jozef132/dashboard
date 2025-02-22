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
  try {
    const keysSnapshot = await db.collection('keys').get();
    if (keysSnapshot.empty) {
      return res.status(200).json({ message: 'No active keys found' });
    }

    const now = new Date();
    let updatedKeys = [];

    for (const doc of keysSnapshot.docs) {
      const data = doc.data();
      const expirationDate = new Date(data.expirationDate);

      if (expirationDate <= now) {
        // Move expired key to `expired_keys` collection
        await db.collection('expired_keys').doc(doc.id).set(data);
        await db.collection('keys').doc(doc.id).delete(); // Remove from active keys

        updatedKeys.push({ key: doc.id, status: 'expired' });
      }
    }

    res.status(200).json({
      message: 'Key check completed',
      updatedKeys,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
