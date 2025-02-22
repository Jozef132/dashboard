export default function handler(req, res) {
    const isLoggedIn = req.cookies.isLoggedIn; // Example: Check a cookie
  
    if (!isLoggedIn) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    res.status(200).json({ message: 'This is a protected route' });
  }