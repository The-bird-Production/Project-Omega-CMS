import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function articleList() {
  const { data: session, status } = useSession({
    required: true,
  });

  const [rowData, setRowData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/article/get/all`,
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
            const jsonData = data;

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

    const intervalId = setInterval(fetchData, 15000);

    return () => clearInterval(intervalId);
  }, [session, status]);

  const editArticle = (slug) => {
    router.push(`/admin/article/edit/${slug}`);
  }

  const delArticle = async (id) => {
    if (status === 'authenticated') {
      const token = session.accessToken || session.user.accessToken;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/article/delete/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
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
          <button className='btn btn-secondary m-1' onClick={() => editArticle(item.slug)}><i className="bi bi-pencil-square"></i></button>
          <button className='btn btn-secondary' onClick={() => delArticle(item.id)}><i className="bi bi-trash"></i></button>
        </div>
      </div>
    </div>
  ));
}
