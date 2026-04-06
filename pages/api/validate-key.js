import admin from 'firebase-admin';

// Initialize Firebase
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Reference Number is required' });
  }

  try {
    // Check if the key exists in the expired_keys collection
    const expiredDoc = await db.collection('expired_keys').doc(key).get();
    if (expiredDoc.exists) {
      return res.status(400).json({ error: 'Subscription has expired', valid: false });
    }

    // Check if the key exists in the keys collection
    const doc = await db.collection('keys').doc(key).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const data = doc.data();
    if (!data.valid) {
      return res.status(400).json({ error: 'Subscription is invalid' });
    }

    const expirationDate = new Date(data.expirationDate);
    const now = new Date();
    const timeRemaining = expirationDate - now;

    if (timeRemaining <= 0) {
      // Move the key to the expired_keys collection
      await db.collection('expired_keys').doc(key).set(data);
      await db.collection('keys').doc(key).delete(); // Remove from the active keys collection
      return res.status(400).json({ error: 'Subscription has expired', valid: false });
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