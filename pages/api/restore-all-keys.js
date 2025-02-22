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