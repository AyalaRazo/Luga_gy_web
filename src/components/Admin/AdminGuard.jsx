import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminGuard({ children, superAdminOnly = false }) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const allowed = superAdminOnly ? isSuperAdmin : isAdmin;
  if (!allowed) return <Navigate to="/admin/citas" replace />;
  return children;
}
