
import { useEffect, useState } from 'react';
import { authClient } from "../../../../lib/authClient";
import FormatedDate from '../../util/FormatedDate';
import { useRouter } from 'next/navigation';


export default function UserList() {
  const [rowData, setRowData] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: users, error } = await authClient.admin.listUsers({
          query: {
            limit: 100,
            offset: 0,
            sortBy: "name",
            sortDirection: "asc",
          },
        });
        if (error) {
          setError(error);
        } else {
          setRowData(users.users || []);
          console.log(users.users);
        }
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const editUser = (id) => {
    router.push(`/admin/user/edit/${id}`);
  };

  // TODO: Remplacer par la méthode better-auth si disponible
  const delUser = async (id) => {
    const { data: deletedUser, error } = await authClient.admin.removeUser({
    userId: id, // required
    });
    // À adapter selon l'API better-auth si elle expose une méthode de suppression
    setRowData((prevData) => prevData.filter((item) => item.id !== id));
  };


  if (error) {
    return <div className="alert alert-danger">Erreur lors du chargement des utilisateurs : {error.message || error.toString()}</div>;
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
