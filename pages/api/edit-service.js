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
  if (req.method === 'PUT') {
    const { id, name } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Service ID and name are required' });
    }

    try {
      // Get the current service document
      const serviceDoc = await db.collection('services').doc(id).get();
      if (!serviceDoc.exists) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const oldName = serviceDoc.data().name; // Get the old name

      // Update the service name in the services collection
      await db.collection('services').doc(id).update({ name });

      // Fetch all keys where serviceCategory matches the old service name
      const keysSnapshot = await db.collection('keys')
        .where('serviceCategory', '==', oldName)
        .get();

      if (!keysSnapshot.empty) {
        const batch = db.batch();

        keysSnapshot.forEach((doc) => {
          batch.update(doc.ref, { serviceCategory: name });
        });

        await batch.commit();
      }

      res.status(200).json({ message: 'Service updated successfully' });
    } catch (err) {
      console.error('Error updating service:', err);
      res.status(500).json({ error: 'Failed to update service' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
