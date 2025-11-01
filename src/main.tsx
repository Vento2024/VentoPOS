import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Router, Route } from 'wouter'
import Layout from './components/Layout'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Catalog from './pages/Catalog'
import PublicCatalog from './pages/PublicCatalog'
import SalesHistory from './pages/SalesHistory'
import HoldSales from './pages/HoldSales'
import Inventory from './pages/Inventory'
import Administration from './pages/Administration'
import CashClosing from './pages/CashClosing'
import Customers from './pages/Customers'
import OverdueCustomers from './pages/OverdueCustomers'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import { initializeData } from './data/seedData'
import './index.css'

// Inicializar datos del sistema
initializeData()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            {/* Public Routes */}
            <Route path="/login" component={Login} />
            <Route path="/unauthorized" component={Unauthorized} />
            <Route path="/catalogo" component={PublicCatalog} />
            
            {/* Protected Routes */}
            <Route path="/">
              <ProtectedRoute>
                <Layout>
                  <Catalog />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/catalog">
              <ProtectedRoute>
                <Layout>
                  <Catalog />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/sales">
              <ProtectedRoute>
                <Layout>
                  <AdminRoute>
                    <SalesHistory />
                  </AdminRoute>
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/hold-sales">
              <ProtectedRoute>
                <Layout>
                  <HoldSales />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/inventory">
              <ProtectedRoute>
                <Layout>
                  <AdminRoute>
                    <Inventory />
                  </AdminRoute>
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/administration">
              <ProtectedRoute>
                <Layout>
                  <AdminRoute>
                    <Administration />
                  </AdminRoute>
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/customers">
              <ProtectedRoute>
                <Layout>
                  <AdminRoute>
                    <Customers />
                  </AdminRoute>
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/overdue-customers">
              <ProtectedRoute>
                <Layout>
                  <AdminRoute>
                    <OverdueCustomers />
                  </AdminRoute>
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/reports">
              <ProtectedRoute>
                <Layout>
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/cash-closing">
              <ProtectedRoute>
                <Layout>
                  <CashClosing />
                </Layout>
              </ProtectedRoute>
            </Route>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)