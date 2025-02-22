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
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }

  try {
    // Check if the key exists in the expired_keys collection
    const expiredDoc = await db.collection('expired_keys').doc(key).get();
    if (expiredDoc.exists) {
      return res.status(400).json({ error: 'Key has expired', valid: false });
    }

    // Check if the key exists in the keys collection
    const doc = await db.collection('keys').doc(key).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Key not found' });
    }

    const data = doc.data();
    if (!data.valid) {
      return res.status(400).json({ error: 'Key is invalid' });
    }

    const expirationDate = new Date(data.expirationDate);
    const now = new Date();
    const timeRemaining = expirationDate - now;

    if (timeRemaining <= 0) {
      // Move the key to the expired_keys collection
      await db.collection('expired_keys').doc(key).set(data);
      await db.collection('keys').doc(key).delete(); // Remove from the active keys collection
      return res.status(400).json({ error: 'Key has expired', valid: false });
    }

    // Convert time remaining to days, hours, minutes, and seconds
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    res.status(200).json({
      valid: true,
      serviceCategory: data.serviceCategory, // Include serviceCategory in the response
      timeRemaining: {
        days: daysRemaining,
        hours: hoursRemaining,
        minutes: minutesRemaining,
        seconds: secondsRemaining,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}