import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import FormatedDate from '../../util/FormatedDate';

export default function LogList() {
  const [rowData, setRowData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const [logsPerPage] = useState(5); // Nombre de logs par page
  const [totalItems, setTotalItems] = useState(0); // Nombre total de logs disponibles
  const [maxId, setMaxId] = useState(null); // ID maximal des logs

  const { data: session, status } = useSession({
    required: true,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      if (status === 'authenticated') {
        const token = session.accessToken || session.user.accessToken;

        try {
          // Charger tous les logs pour obtenir `maxId` et `totalItems`
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
            setTotalItems(data.totalItems); // Total des logs
            setMaxId(data.data[0].id); // ID maximal (assumant que les logs sont triés décroissants dans la réponse)
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

        // Calculer `startId` et `endId` en décroissant
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
            setRowData(data.data); // Les données sont déjà dans le bon ordre
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

  // Passer à la page précédente
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Passer à la page suivante
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalItems / logsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <ul className="list-group">
        {rowData.map((item, index) => (
          <div className="card card-body m-3 bg-primary text-white" key={index}>
            <div className="container row">
              <div
                className={'col-10' + item.color}
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

      {/* Pagination */}
      <div className="pagination-controls text-white">
        <button
          disabled={currentPage === 1}
          onClick={handlePrevPage}
          className="btn btn-primary m-2"
        >
          Précédent
        </button>
        <span>
          Page {currentPage} sur {Math.ceil(totalItems / logsPerPage)}
        </span>
        <button
          disabled={currentPage === Math.ceil(totalItems / logsPerPage)}
          onClick={handleNextPage}
          className="btn btn-primary m-2"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
