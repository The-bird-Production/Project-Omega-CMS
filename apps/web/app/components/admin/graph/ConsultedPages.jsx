'use client';
import { useEffect, useRef, useState } from 'react';

export default function Components() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [data, setData] = useState(null);
  const [labels, setLabels] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/web_stats/all`,
          {
            credentials: 'include',
            mode: 'cors',
          }
        );
        const jsonData = await res.json();
        const rowData = jsonData.data;

        const pageCounts = rowData.reduce((acc, curr) => {
          if (!acc[curr.page]) {
            acc[curr.page] = 0;
          }
          acc[curr.page] += curr.count;
          return acc;
        }, {});

        const labels = Object.keys(pageCounts);
        const data = labels.map((label) => pageCounts[label]);
        setLabels(labels);
        setData(data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
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
                let percentage = (
                  (data[tooltipItem.dataIndex] / total) *
                  100
                ).toFixed(2);
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
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <canvas ref={chartRef} id="userChart" width="400" height="300"></canvas>
  );
}
