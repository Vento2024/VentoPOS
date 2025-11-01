import React from 'react'
import { Redirect } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types'
import { SkeletonCard } from './SkeletonLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  adminOnly?: boolean
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  adminOnly = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />
  }

  // Check admin-only access
  if (adminOnly && user.role !== 'admin') {
    return <Redirect to="/unauthorized" />
  }

  // Check specific role requirement
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Redirect to="/unauthorized" />
  }

  return <>{children}</>
}

// Higher-order component for admin-only routes
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      {children}
    </ProtectedRoute>
  )
}

// Higher-order component for cashier routes
export function CashierRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="cashier">
      {children}
    </ProtectedRoute>
  )
}