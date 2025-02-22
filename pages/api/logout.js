import { serialize } from 'cookie';

export default function handler(req, res) {
  // Clear the authentication cookie
  res.setHeader(
    'Set-Cookie',
    serialize('isLoggedIn', '', {
      path: '/', // The cookie is accessible across the entire site
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      maxAge: -1, // Expire the cookie immediately
    })
  );

  // Send a success response
  res.status(200).json({ message: 'Logged out successfully' });
}