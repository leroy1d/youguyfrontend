// src/components/MainLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
// Supprimez l'import de ThemeProvider ici car il est déjà dans App.jsx

const MainLayout = () => {
  return (
    // Supprimez le ThemeProvider d'ici car il est déjà dans App.jsx
    <div className="flex flex-col md:flex-row bg-white dark:bg-black">
      <div className="md:fixed md:left-0 md:top-0 md:h-screen">
        <LeftSidebar />
      </div>
      <div className="flex-1 mt-10 mb-20 md:ml-[16%] md:mr-[25%]">
        <Outlet />
      </div>
      <div className="hidden lg:block fixed right-0 top-0 h-screen">
        <RightSidebar />
      </div>
    </div>
  )
}

export default MainLayout