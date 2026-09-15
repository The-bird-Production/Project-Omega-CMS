'use client';
import { useEffect, useState } from 'react';

export default function TotalViewedPages({ startDate, endDate }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/web_stats/total-views?${params.toString()}`,
          {
            mode: 'cors',
            credentials: 'include',
          }
        );
        const jsonData = await res.json();
        if (!res.ok) throw new Error(jsonData.message || 'Erreur lors du chargement');

        setCount(jsonData.data ?? 0);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <> {count} pages vues</>;
}
