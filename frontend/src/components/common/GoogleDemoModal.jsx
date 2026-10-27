import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

const PRESET_DEMO_PROFILES = [
  {
    name: 'Alex Morgan',
    email: 'alex.morgan.demo@gmail.com',
    role: 'Product Designer (Standard Demo)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  },
  {
    name: 'Rohan Sharma',
    email: 'rohan.sharma.demo@gmail.com',
    role: 'Software Engineer (INR ₹ Demo)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel.demo@gmail.com',
    role: 'Freelance Consultant',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  }
];

export const GoogleDemoModal = ({ isOpen, onClose, onSelectProfile, isSubmitting = false }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customName, setCustomName] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleConfirm = () => {
    if (useCustom) {
      const name = customName.trim() || 'Guest Explorer';
      const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      onSelectProfile({
        name,
        email: `${cleanSlug || 'guest'}.demo@gmail.com`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      });
    } else {
      onSelectProfile(PRESET_DEMO_PROFILES[selectedIdx]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Sign-In (Local Demonstration)"
      subtitle="Interactive demo flow for offline and local evaluation"
      maxWidth="max-w-md"
    >
      <div className="google-demo-content">
        <div className="demo-notice-banner">
          <ShieldAlert className="demo-notice-icon" size={20} />
          <div className="demo-notice-text">
            <strong>Demonstration Notice:</strong>
            <p>
              This is a sandbox demo of the Google sign-in experience. Real Google OAuth requires a registered Google Cloud client ID & redirect URI. No Google passwords are ever requested or stored.
            </p>
          </div>
        </div>

        <p className="demo-instruction">
          Choose a simulated Google profile to continue with an instant demo session:
        </p>

        <div className="profile-selector-list">
          {PRESET_DEMO_PROFILES.map((profile, idx) => (
            <div
              key={profile.email}
              className={`profile-card ${!useCustom && selectedIdx === idx ? 'profile-card-active' : ''}`}
              onClick={() => {
                setUseCustom(false);
                setSelectedIdx(idx);
              }}
            >
              <img src={profile.avatar} alt={profile.name} className="profile-avatar" />
              <div className="profile-meta">
                <span className="profile-name">{profile.name}</span>
                <span className="profile-email">{profile.email}</span>
                <span className="profile-role">{profile.role}</span>
              </div>
              {!useCustom && selectedIdx === idx && (
                <UserCheck size={18} className="profile-check-icon text-primary" />
              )}
            </div>
          ))}

          {/* Custom demo option */}
          <div
            className={`profile-card ${useCustom ? 'profile-card-active' : ''}`}
            onClick={() => setUseCustom(true)}
          >
            <div className="custom-avatar-placeholder">
              <Sparkles size={18} />
            </div>
            <div className="profile-meta flex-1">
              <span className="profile-name">Custom Demo Identity</span>
              {useCustom ? (
                <input
                  type="text"
                  placeholder="Enter your name (e.g. John Doe)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="custom-name-input"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="profile-email">Click to customize display name</span>
              )}
            </div>
            {useCustom && <UserCheck size={18} className="profile-check-icon text-primary" />}
          </div>
        </div>

        <div className="demo-modal-actions">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isSubmitting}
          >
            Continue as {useCustom ? (customName.trim() || 'Guest') : PRESET_DEMO_PROFILES[selectedIdx].name}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
