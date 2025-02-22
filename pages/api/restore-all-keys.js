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
    try {
      // Fetch all expired keys
      const expiredKeysSnapshot = await db.collection('expired_keys').get();

      if (expiredKeysSnapshot.empty) {
        return res.status(404).json({ error: 'No expired keys found' });
      }

      // Move each expired key back to the active keys collection
      const batch = db.batch(); // Use a batch for atomic operations
      expiredKeysSnapshot.forEach((doc) => {
        const data = doc.data();
        const keyRef = db.collection('keys').doc(doc.id); // Reference to the active keys collection
        batch.set(keyRef, data); // Add to active keys
        batch.delete(doc.ref); // Remove from expired keys
      });

      await batch.commit(); // Commit the batch operation
      res.status(200).json({ message: 'All expired keys restored successfully' });
    } catch (err) {
      console.error('Error restoring all keys:', err);
      res.status(500).json({ error: 'Failed to restore all keys' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}