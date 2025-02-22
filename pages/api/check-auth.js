export default function handler(req, res) {
    // Check if the user is logged in (e.g., using cookies or tokens)
    const isLoggedIn = req.cookies.isLoggedIn; // Example: Check a cookie
  
    if (!isLoggedIn) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    res.status(200).json({ message: 'Authenticated' });
  }