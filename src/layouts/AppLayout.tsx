import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import FocusOverlay from '../components/FocusOverlay'

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-background text-white flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
            <FocusOverlay />
        </div>
    )
}
