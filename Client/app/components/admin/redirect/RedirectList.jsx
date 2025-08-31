import { useEffect, useState } from 'react';

import FormatedDate from '../../util/FormatedDate';

export default function RedirectList() {
  

  const [rowData, setRowData] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/redirect/all`,
            {
              credentials: 'include',
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
      
    };

    fetchData();

  }, [session, status]);

  const delRedirect = async (id) => {
   
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/redirect/delete/${id}`,
            {
              method: 'DELETE',
              credentials: 'include',
              mode: 'cors',
            }
          );
  
          if (res.ok) {
            setRowData((prevData) => prevData.filter((item) => item.id !== id));
          } else {
            console.error('Failed to delete redirect:', res.statusText);
          }
        } catch (error) {
          console.error('Error deleting redirect:', error);
        } 
      
  }

  

  return rowData.map((item, index) => (
    <div className="card card-body m-3 bg-primary text-white" key={index}>
      <div className="container row">
        <div className="col-10">From : {item.from}</div>
        <div className="col-10">To : {item.to}</div>
        <div className="col-10">
          Last Update : <FormatedDate rowDate={item.updatedAt} />
        </div>

        <div className="col-2">
          <button
            className="btn btn-secondary"
            onClick={() => delRedirect(item.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  ));
}
