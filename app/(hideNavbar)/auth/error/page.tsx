'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    console.log('🔍 Auth Error Page - Query params:', error);

    if (!error || error === 'undefined') {
      setErrorMessage('An unexpected authentication error occurred. Please try again.');
    } else {
      setErrorMessage(error);
    }
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Authentication Error</h1>
      <p style={{ color: 'red', margin: '1rem 0' }}>{errorMessage}</p>
      <button
        onClick={() => router.push('/admin-login')}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Return to Login
      </button>
    </div>
  );
}
