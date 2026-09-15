'use client';
import { useEffect, useRef, useState } from 'react';

export default function ConsultedPages({ startDate, endDate }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [data, setData] = useState(null);
  const [labels, setLabels] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '8' });
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/web_stats/top-pages?${params.toString()}`,
          {
            credentials: 'include',
            mode: 'cors',
          }
        );
        const jsonData = await res.json();
        if (!res.ok) throw new Error(jsonData.message || 'Erreur lors du chargement');

        const rows = jsonData.data ?? [];
        setLabels(rows.map((r) => r.page));
        setData(rows.map((r) => r.views));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    if (!data || !labels) return;
    require('../../../../public/js/chart');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const userData = {
      labels: labels,
      datasets: [
        {
          label: 'Nombre de visites',
          data: data,
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const config = {
      type: 'pie',
      data: userData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                let total = 0;
                data.forEach((item) => {
                  total += item;
                });
                let percentage = total > 0 ? ((data[tooltipItem.dataIndex] / total) * 100).toFixed(2) : '0.00';
                return labels[tooltipItem.dataIndex] + ': ' + percentage + '%';
              },
            },
          },
        },
      },
    };

    chartInstanceRef.current = new Chart(chartRef.current, config);
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, labels]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!labels || labels.length === 0) {
    return <p className="text-muted mb-0">Aucune vue enregistrée pour cette période.</p>;
  }

  return (
    <canvas ref={chartRef} id="userChart" width="400" height="300"></canvas>
  );
}
