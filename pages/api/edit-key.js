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