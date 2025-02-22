import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase
const serviceAccount = require('./cred.json'); // Adjust the path
if (!admin.apps.length) {
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