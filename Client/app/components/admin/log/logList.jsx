import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import FormatedDate from '../../util/FormatedDate';
import { useRouter } from 'next/navigation';

export default function LogList() {


    const router = useRouter()
  const [rowData, setRowData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [maxId, setMaxId] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]); // Gérer les logs sélectionnés
  const [selectAll, setSelectAll] = useState(false); // Gérer l'état "tout sélectionner"

  const { data: session, status } = useSession({
    required: true,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/logs/get/?startId=1&endId=`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              mode: 'cors',
            }
          );

          if (res.ok) {
            const data = await res.json();
            setTotalItems(data.totalItems);
            setMaxId(data.data[0].id);
          } else {
            console.error('Failed to fetch logs:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching logs:', error);
        }
      }
    };

    fetchInitialData();
  }, [session, status]);

  useEffect(() => {
    const fetchPageData = async () => {
      if (status === 'authenticated' && maxId !== null) {
        const token = session.accessToken || session.user.accessToken;

        const startId = maxId - (currentPage - 1) * logsPerPage;
        const endId = Math.max(1, startId - logsPerPage + 1);

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/logs/get/?startId=${endId}&endId=${startId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              mode: 'cors',
            }
          );

          if (res.ok) {
            const data = await res.json();
            setRowData(data.data);
          } else {
            console.error('Failed to fetch logs:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching logs:', error);
        }
      }
    };

    fetchPageData();
  }, [session, status, currentPage, logsPerPage, maxId]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.floor(totalItems / logsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      setSelectedLogs(rowData.map((log) => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedLogs.includes(id)) {
      setSelectedLogs(selectedLogs.filter((logId) => logId !== id));
    } else {
      setSelectedLogs([...selectedLogs, id]);
    }
  };

  const handleDeleteLogs = async () => {
    if (selectedLogs.length === 0) return;

    const token = session.accessToken || session.user.accessToken;

    try {
      const startId = Math.min(...selectedLogs);
      const endId = Math.max(...selectedLogs);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/logs/delete/?startId=${startId}&endId=${endId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (res.ok) {
        console.log('Logs deleted successfully');
        setRowData(rowData.filter((log) => !selectedLogs.includes(log.id)));
        setSelectedLogs([]);
        setSelectAll(false);
        router.refresh()
        
      } else {
        console.error('Failed to delete logs:', res.statusText);
      }
    } catch (error) {
      console.error('Error deleting logs:', error);
    }
  };

  return (
    <div>
      <ul className="list-group">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label className="form-check-label text-white">Tout sélectionner</label>
        </div>

        {rowData.map((item) => (
          <div className="card card-body m-3 bg-primary text-white" key={item.id}>
            <div className="container row">
              <div className="col-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedLogs.includes(item.id)}
                  onChange={() => handleCheckboxChange(item.id)}
                />
              </div>
              <div
                className={'col-9' + item.color}
                style={{ color: item.color }}
              >
                <h3>{item.action}</h3>
              </div>
              <div className="col-10">
                <h4>{item.user}</h4>
              </div>
              <div className="col-10">
                <h5>
                  <FormatedDate rowDate={item.date} />
                </h5>
              </div>
            </div>
          </div>
        ))}
      </ul>

      <button
        className="btn btn-danger mt-3"
        onClick={handleDeleteLogs}
        disabled={selectedLogs.length === 0}
      >
        Supprimer les logs sélectionnés
      </button>

      <div className="pagination-controls mt-3 text-white">
        <button
          disabled={currentPage === 1}
          onClick={handlePrevPage}
          className="btn btn-primary m-2"
        >
          Précédent
        </button>
        <span>
          Page {currentPage} sur {Math.floor(totalItems / logsPerPage)}
        </span>
        <button
          disabled={currentPage === Math.floor(totalItems / logsPerPage)}
          onClick={handleNextPage}
          className="btn btn-primary m-2"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
