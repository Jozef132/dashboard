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
