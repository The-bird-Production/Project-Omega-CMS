'use client';
import { useEffect, useRef, useState } from 'react';
import { authClient } from '../../../../lib/authClient';

export default function NumberOfUser() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/otherstats/number/user`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        const jsonData = await res.json();
        const rawData = jsonData.data;

        const totalPagesViews = rawData;

        setCount(totalPagesViews);

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

  return <> {count} Utilisateurs</>;
}
