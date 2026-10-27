import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'You have not added any data yet. Start by creating your first entry.',
  actionText,
  actionIcon,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-state-icon-box">
          <Icon size={36} className="empty-state-icon" />
        </div>
      )}
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      <div className="empty-state-actions">
        {actionText && onAction && (
          <Button variant="primary" icon={actionIcon} onClick={onAction}>
            {actionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};
