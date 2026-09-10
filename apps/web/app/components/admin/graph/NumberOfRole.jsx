'use client';
import { useEffect, useRef, useState } from 'react';

export default function NumberOfRole() {
 
  const { data: session, status } = useSession();
 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(null)

  useEffect(() => {
    
  }, []);

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
   <> Nothing for now
   </>
    
  );
}
