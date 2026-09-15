'use client';
import { useEffect, useState } from 'react';

export default function ApiResponseTime({ startDate, endDate }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/summary?${params.toString()}`,
          {
            credentials: 'include',
            mode: 'cors',
          }
        );
        const jsonData = await res.json();
        if (!res.ok) throw new Error(jsonData.message || 'Erreur lors du chargement');

        setSummary(jsonData.data);
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

  return (
    <>
      {Math.round(summary.averageResponseTime)} ms API response time
      <div className="text-muted small mt-1">{summary.totalRequests} requêtes</div>
    </>
  );
}
