
import { useState, useEffect } from 'react';

const Notification = ({ message, show }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  if (!visible) {
    return null;
  }

  return (
    <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
      {message}
      <button type="button" className="btn-close" onClick={() => setVisible(false)} aria-label="Close"></button>
    </div>
  );
};

export default Notification;
