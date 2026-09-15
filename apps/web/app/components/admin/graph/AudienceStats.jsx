'use client';
import { useEffect, useState } from 'react';

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m${String(seconds).padStart(2, '0')}s`;
}

function Breakdown({ title, rows, labelKey }) {
  if (rows.length === 0) return null;
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return (
    <div className="mb-2">
      <div className="fw-semibold small">{title}</div>
      <ul className="list-unstyled mb-0 small">
        {rows.map((row) => (
          <li key={row[labelKey]} className="d-flex justify-content-between">
            <span>{row[labelKey]}</span>
            <span>{total > 0 ? Math.round((row.count / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AudienceStats({ startDate, endDate }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audience, setAudience] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/web_stats/audience?${params.toString()}`,
          {
            credentials: 'include',
            mode: 'cors',
          }
        );
        const jsonData = await res.json();
        if (!res.ok) throw new Error(jsonData.message || 'Erreur lors du chargement');

        setAudience(jsonData.data);
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
    <div className="row g-3">
      <div className="col-md-4">
        <div className="fw-semibold small">Visiteurs uniques</div>
        <div className="fs-4">{audience.uniqueVisitors}</div>
      </div>
      <div className="col-md-4">
        <div className="fw-semibold small">Durée moyenne de session</div>
        <div className="fs-4">{formatDuration(audience.averageSessionDurationSeconds)}</div>
      </div>
      <div className="col-md-4">
        <div className="fw-semibold small">Taux de rebond</div>
        <div className="fs-4">{audience.bounceRate}%</div>
      </div>

      <div className="col-md-4">
        <Breakdown title="Sources de trafic" rows={audience.topReferrers} labelKey="referrer" />
      </div>
      <div className="col-md-4">
        <Breakdown title="Appareil" rows={audience.devices} labelKey="device" />
      </div>
      <div className="col-md-4">
        <Breakdown title="Navigateur" rows={audience.browsers} labelKey="browser" />
      </div>
    </div>
  );
}
