import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-root">
      <div className="not-found-card text-center animate-scale-up">
        <div className="not-found-icon-box">
          <Wallet size={48} className="text-primary" />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          The page or financial ledger view you are looking for does not exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};
