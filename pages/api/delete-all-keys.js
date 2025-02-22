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
  if (req.method === 'DELETE') {
    try {
      // Fetch all expired keys
      const KeysSnapshot = await db.collection('keys').get();

      if (KeysSnapshot.empty) {
        return res.status(404).json({ error: 'No keys found' });
      }

      // Delete all expired keys
      const batch = db.batch(); // Use a batch for atomic operations
      KeysSnapshot.forEach((doc) => {
        batch.delete(doc.ref); // Delete each document
      });

      await batch.commit(); // Commit the batch operation
      res.status(200).json({ message: 'All keys deleted successfully' });
    } catch (err) {
      console.error('Error deleting all keys:', err);
      res.status(500).json({ error: 'Failed to delete all keys' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}