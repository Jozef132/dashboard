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
  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Service ID is required' });
    }

    try {
      await db.collection('services').doc(id).delete();
      res.status(200).json({ message: 'Service deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete service' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}