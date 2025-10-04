import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function draftList() {
  
  const [rowData, setRowData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/article/get/all/drafts`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              mode: 'cors',
            }
          );

          if (res.ok) {
            const data = await res.json();
            const jsonData = data;

            setRowData(jsonData);
          } else {
            console.error('Failed to fetch data:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      
    };

    fetchData();

    const intervalId = setInterval(fetchData, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const editArticle = (slug) => {
    router.push(`/admin/article/drafts/edit/${slug}`);
  }

  const delArticle = async (id) => {
   
      
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/article/delete/draft/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            mode: 'cors',
          }
        );

        if (res.ok) {
          setRowData((prevData) => prevData.filter((item) => item.id !== id));
        } else {
          console.error('Failed to delete image:', res.statusText);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      } 
    
  } 
  console.log(rowData);
  if (!rowData) {
    return <div className="text-center text-white">No articles found.</div>;
  }
  return rowData.map((item, index) => (
    <div className="card card-body m-3 bg-primary text-white" key={index}>
      <div className='container row'>
        <div className="col-10">{item.title}</div>
        <div className="col-2">
          <button className='btn btn-secondary m-1' onClick={() => editArticle(item.draftId)}><i className="bi bi-pencil-square"></i></button>
          <button className='btn btn-secondary' onClick={() => delArticle(item.draftId)}><i className="bi bi-trash"></i></button>
        </div>
      </div>
    </div>
  ));
}
