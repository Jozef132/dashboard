import admin from 'firebase-admin';

// Initialize Firebase
if (!admin.apps.length) {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id, email, password, discordUsername, phoneNumber, days, serviceCategory } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Reference Number (Key) ID is required' });
    }

    try {
      const updateData = {};
      
      // Update new fields if they exist
      if (email !== undefined) updateData.email = email;
      if (password !== undefined) updateData.password = password;
      if (discordUsername !== undefined) updateData.discordUsername = discordUsername;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      
      if (days) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + parseInt(days));
        updateData.expirationDate = expirationDate.toISOString();
      }
      if (serviceCategory) updateData.serviceCategory = serviceCategory;

      await db.collection('keys').doc(id).update(updateData);

      res.status(200).json({ message: 'Subscription updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}