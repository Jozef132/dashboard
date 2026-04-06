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
  if (req.method === 'GET') {
    try {
      const servicesSnapshot = await db.collection('services').get();
      const totalServices = servicesSnapshot.size; // ✅ Get the total count

      res.status(200).json({ totalServices });
    } catch (err) {
      console.error("API Error:", err);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
