import { ReactNode } from 'react';
import Navigation from './Navigation';
import { ToastContainer } from './Toast';
import { useToastContext } from '../contexts/ToastContext';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { toasts, dismissToast } = useToastContext();
  const [location] = useLocation();
  
  // Check if we're on the POS page (catalog)
  const isPOSPage = location === '/';

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Navigation />
      <main className={`flex-1 ${isPOSPage ? 'h-screen overflow-hidden' : 'pb-16 md:pb-0'}`}>
        {isPOSPage ? (
          // Full screen POS layout
          <div className="h-full">
            {children}
          </div>
        ) : (
          // Regular page layout with padding
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Layout;