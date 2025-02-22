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
