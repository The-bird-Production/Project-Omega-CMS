import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import FormatedDate from '../../util/FormatedDate';
import { useRouter } from 'next/navigation';

export default function userList() {
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
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/get/all`,
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

    const intervalId = setInterval(fetchData, 15000);

    return () => clearInterval(intervalId);
  }, [session, status]);

  const editUser = (id) => {
    router.push(`/admin/user/edit/${id}`);
  };

  const delUser = async (id) => {
    if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/delete/${id}`,
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
            console.error('Failed to delete user:', res.statusText);
          }
        } catch (error) {
          console.error('Error deleting user:', error);
        } 
      }
  }

  return rowData.map((item, index) => (
    <div className="card card-body m-3 bg-primary text-white" key={index}>
      <div className="container row">
        <div className="col-10">Nom : {item.name}</div>
        <div className="col-10">Email : {item.email}</div>
        <div className="col-10">Username : {item.username}</div>
        <div className="col-10">
          Last Update : <FormatedDate rowDate={item.updatedAt} />
        </div>

        <div className="col-2">
          <button
            className="btn btn-secondary m-1"
            onClick={() => editUser(item.id)}
          >
            <i className="bi bi-pencil-square"></i>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => delUser(item.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  ));
}
