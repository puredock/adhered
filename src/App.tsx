import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

import Audit from './pages/Audit'
import AuditDetail from './pages/AuditDetail'
import Catalog from './pages/Catalog'
import DeviceDetail from './pages/DeviceDetail'
import Index from './pages/Index'
import NetworkDetail from './pages/NetworkDetail'
import Networks from './pages/Networks'
import NotFound from './pages/NotFound'
import Scans from './pages/Scans'
import ScansDetail from './pages/ScansDetail'

const queryClient = new QueryClient()

const AppContent = () => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
    const showSidebar = !isDemoMode

    return (
        <div className="flex min-h-screen w-full">
            {showSidebar && <AppSidebar />}

            <Routes>
                <Route path="/" element={<Index />} />

                {!isDemoMode && (
                    <>
                        <Route path="/audits" element={<Audit />} />
                        <Route path="/audits/:id" element={<AuditDetail />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/scans" element={<Scans />} />
                        <Route path="/scans/:id" element={<ScansDetail />} />
                        <Route path="/networks" element={<Networks />} />
                        <Route path="/networks/:id" element={<NetworkDetail />} />
                        <Route
                            path="/networks/:networkId/devices/:deviceId"
                            element={<DeviceDetail />}
                        />
                    </>
                )}

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    )
}

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
)

export default App
