import React from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  X
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

export const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications
  } = useFinance();
  const { showToast } = useToast();

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    showToast('All notifications marked as read.', 'info');
  };

  const handleClearAll = () => {
    clearAllNotifications();
    showToast('Cleared all notifications.', 'info');
  };

  return (
    <div className="notifications-page space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="page-title">Notification Center</h2>
            {unreadCount > 0 && (
              <Badge variant="primary">{unreadCount} Unread</Badge>
            )}
          </div>
          <p className="page-subtitle">
            System alerts, budget threshold warnings, and savings goal milestones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={handleClearAll}
              className="text-danger"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  className={`notification-card ${isUnread ? 'notification-unread' : ''}`}
                  onClick={() => isUnread && markNotificationAsRead(notif.id)}
                >
                  <div className="notif-icon-col">
                    {notif.type === 'warning' ? (
                      <div className="notif-icon-box bg-warning-soft text-warning">
                        <AlertTriangle size={18} />
                      </div>
                    ) : notif.type === 'success' ? (
                      <div className="notif-icon-box bg-success-soft text-success">
                        <CheckCircle2 size={18} />
                      </div>
                    ) : (
                      <div className="notif-icon-box bg-primary-soft text-primary">
                        <Info size={18} />
                      </div>
                    )}
                  </div>

                  <div className="notif-content-col flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="notif-title">{notif.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="notif-time text-xs text-muted flex items-center gap-1">
                          <Calendar size={12} />
                          {notif.createdAt ? formatDate(notif.createdAt, 'short') : 'Recent'}
                        </span>
                        <button
                          type="button"
                          className="notif-delete-btn"
                          title="Remove notification"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notif.id);
                          }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="notif-message">{notif.message}</p>
                    {isUnread && (
                      <span className="notif-unread-dot" title="Unread notification" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="p-8">
            <EmptyState
              icon={Bell}
              title="All Caught Up!"
              description="You have no notifications or threshold alerts at this moment."
            />
          </Card>
        )}
      </div>
    </div>
  );
};
