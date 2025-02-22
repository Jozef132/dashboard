import admin from 'firebase-admin';

// Initialize Firebase
if (!admin.apps.length) {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAINL,
  };

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