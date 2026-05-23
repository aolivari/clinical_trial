import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../ui/pages/LoginPage';
import { AppLayout } from '../ui/layouts/AppLayout';
import { DashboardPage } from '../ui/pages/DashboardPage';
import { ParticipantsPage } from '../ui/pages/ParticipantsPage';
import { AddSubjectPage } from '../ui/pages/AddSubjectPage';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'participants',
        element: <ParticipantsPage />,
      },
      {
        path: 'add-subject',
        element: <AddSubjectPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
