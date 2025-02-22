import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const checkKeys = async () => {
      try {
        await fetch('/api/checkKeys', { method: 'POST' });
      } catch (error) {
        console.error('Error checking keys:', error);
      }
    };

    checkKeys();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
