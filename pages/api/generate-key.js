import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

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
  const { username, expirationDate, serviceCategory } = req.body;

  if (!username || !expirationDate || !serviceCategory) {
    return res.status(400).json({ error: 'Username, expiration date, and service category are required' });
  }

  try {
    const key = uuidv4(); // Generate a random key

    // Save the key to Firestore
    await db.collection('keys').doc(key).set({
      username,
      serviceCategory,
      valid: true,
      expirationDate: new Date(expirationDate).toISOString(), // Ensure the date is in ISO format
    });

    res.status(200).json({ key });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate key' });
  }
}