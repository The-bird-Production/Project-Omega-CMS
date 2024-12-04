import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import FormatedDate from '../../util/FormatedDate'

export default function LogList() {
  const [rowData, setRowData] = useState([]);

  const { data: session, status } = useSession({
    required: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/logs/get/?startId=&endId=`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              mode: 'cors',
            }
          );

          if (res.ok) {
            const data = await res.json();
            const jsonData = data.data;
            setRowData(jsonData);
          } else {
            console.error('Failed to fetch data:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 3000);

    return () => clearInterval(intervalId);
  }, [session, status]);

  return (
    <div>
      <ul className="list-group">
        {rowData.map((item, index) => (

          <div className="card card-body m-3 bg-primary text-white" key={index}>
            <div className="container row">
              <div className={"col-10" + item.color} style={{color: item.color}}><h3>{item.action}</h3></div>
              <div className='col-10'><h4>{item.user}</h4></div>
              <div className='col-10'><h5><FormatedDate rowDate={item.date}/></h5></div>
              
            </div>
          </div>
        ))}
      </ul>
      
    </div>
  );
}
