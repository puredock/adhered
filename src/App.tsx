import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { api } from '@/lib/api'

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
    const location = useLocation()
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

    // Check if we're on the landing page
    const { data: networksData } = useQuery({
        queryKey: ['networks'],
        queryFn: () => api.networks.list(),
        enabled: location.pathname === '/',
    })

    const { data: devicesData } = useQuery({
        queryKey: ['devices'],
        queryFn: () => api.devices.list(),
        enabled: location.pathname === '/',
    })

    const { data: scansData } = useQuery({
        queryKey: ['scans'],
        queryFn: () => api.scans.list(),
        enabled: location.pathname === '/',
    })

    const networks = networksData?.networks || []
    const devices = devicesData?.devices || []
    const scans = scansData?.scans || []
    const isEmpty = networks.length === 0 && devices.length === 0 && scans.length === 0

    // Show sidebar only if not in demo mode AND not on landing page
    const showSidebar = !isDemoMode && !(location.pathname === '/' && (isEmpty || isDemoMode))

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
