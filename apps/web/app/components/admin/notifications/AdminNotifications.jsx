'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const MAX_NOTIFICATIONS = 20;

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin`, {
      withCredentials: true,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('log:new', (log) => {
      setNotifications((prev) => [log, ...prev].slice(0, MAX_NOTIFICATIONS));
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) setUnreadCount(0);
  };

  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-primary btn-sm position-relative"
        onClick={toggleOpen}
        aria-label="Notifications"
      >
        <i className="bi bi-bell" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <ul className="dropdown-menu dropdown-menu-end bg-secondary text-light show" style={{ minWidth: '300px' }}>
          <li className="dropdown-header text-light">Activité récente</li>
          {notifications.length === 0 ? (
            <li className="dropdown-item text-muted">Aucune notification pour le moment.</li>
          ) : (
            notifications.map((log) => (
              <li key={log.id} className="dropdown-item" style={{ color: log.color, whiteSpace: 'normal' }}>
                <div>{log.action}</div>
                <small className="text-muted">{log.user}</small>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
