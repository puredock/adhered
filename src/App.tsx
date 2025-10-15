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

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/networks" element={<Networks />} />
                        <Route path="/networks/:id" element={<NetworkDetail />} />
                        <Route
                            path="/networks/:networkId/devices/:deviceId"
                            element={<DeviceDetail />}
                        />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/audits" element={<Audit />} />
                        <Route path="/audits/:id" element={<AuditDetail />} />
                        <Route path="/scans" element={<Scans />} />
                        <Route path="/scans/:id" element={<ScansDetail />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
)

export default App
