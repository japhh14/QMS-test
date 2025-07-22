'use client';

export default function TestEnv() {
  return (
    <pre>
      {JSON.stringify({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NODE_ENV: process.env.NODE_ENV,
      }, null, 2)}
    </pre>
  );
} 