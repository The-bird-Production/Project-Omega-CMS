'use client';
import { useEffect, useRef, useState } from 'react';

export default function Components() {
 

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/all`,
          {
            credentials: 'include',
            mode: 'cors',
          }
        );
        const jsonData = await res.json();
        const rawData = jsonData.data;

        const totalResponseTime = rawData.reduce(
          (sum, entry) => sum + entry.averageResponseTime,
          0
        );
        const averageResponseTime = totalResponseTime / rawData.length;
        setCount(averageResponseTime);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <> {count} ms API response time</>;
}
