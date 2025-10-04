import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

export default function Component() {

  const [rowData, setRowData] = useState([]);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/get/all`,
            {
              credentials: 'include',
              mode: 'cors',
            }
          );

          if (res.ok) {
            const data = await res.json();
            const jsonData = data.data.files;
            setRowData(jsonData);
          } else {
            console.error('Failed to fetch data:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      
    };

    fetchData();

    const intervalId = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  const delImage = async (id) => {
    if (status === 'authenticated') {
      const token = session.accessToken || session.user.accessToken;
      setLoadingIds((prev) => new Set(prev).add(id)); // Add id to loading set
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/delete/${id}`,
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
      } finally {
        setLoadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id); // Remove id from loading set
          return newSet;
        });
      }
    }
  };

  const editImage = (slug) => {
    router.push(`/admin/image/edit/${slug}`);
  };

  return (
    <div>
      <ul className="list-group">
        {rowData.map((item, index) => (
          <li
            key={index}
            className="list-group-item bg-secondary border border-secondary text-light shadow m-2 rounded"
          >
            {' '}
            <div className="container row p-4">
              <div className="col-4">
                <img
                  src={
                    process.env.NEXT_PUBLIC_BACKEND_URL + '/image/' + item.file
                  }
                  crossOrigin="anonymous"
                  className="img-fluid"
                ></img>
              </div>
              <div className="col-4">
                <ul>
                  <li>Titre : {item.title}</li>
                  <li>Alt : {item.alt}</li>
                  <li>Slug : /{item.slug}</li>
                </ul>
              </div>
              {loadingIds.has(item.id) ? (
                <div className='col-4'>
                  <div className="spinner-border" role="status">
                    <span className="sr-only"></span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="col-4">
                    <button
                      className="btn btn-primary m-2"
                      onClick={() => editImage(item.slug)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className=" btn btn-primary m-2"
                      onClick={() => delImage(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p>Nombre d'image : {rowData.length}</p>
    </div>
  );
}
