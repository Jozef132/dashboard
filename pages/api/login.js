import { serialize } from 'cookie';

export default function handler(req, res) {
  const { username, password } = req.body;

  // Hardcoded admin credentials (replace with a proper auth system in production)
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'password';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set a cookie to indicate the user is logged in
    res.setHeader(
      'Set-Cookie',
      serialize('isLoggedIn', 'true', {
        path: '/',
        httpOnly: true, // Prevent client-side access
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
    );
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}