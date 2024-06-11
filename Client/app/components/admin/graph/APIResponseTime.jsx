'use client';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Components() {
 
  const { data: session, status } = useSession();
 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/all`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              mode: 'cors',
            }
          );
          const jsonData = await res.json();
          const rawData = jsonData.data;

          const totalResponseTime = rawData.reduce((sum, entry) => sum + entry.averageResponseTime, 0);
          const averageResponseTime = totalResponseTime / rawData.length;
          setCount(averageResponseTime)
         
         
          

          setLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError(error.message);
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status, session]);

  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
   <> {count} ms API response time
   </>
    
  );
}
