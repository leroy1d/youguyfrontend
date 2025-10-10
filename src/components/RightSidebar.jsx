import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SuggestedUsers from './SuggestedUsers'
import { useTheme } from '@/contexts/ThemeContext';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth)
  const { isDark } = useTheme();

  return (
    <div className='hidden lg:block w-80 fixed right-40 top-0 h-screen overflow-y-auto p-8 bg-white dark:bg-black'>
      {/* Section Profil Utilisateur */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <Link to={`/profile/${user?._id}`}>
            <Avatar className='w-12 h-12'>
              <AvatarImage src={user?.profilePicture} alt="profile" />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <h1 className='font-semibold text-sm text-black dark:text-white'>
              <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
            </h1>
            <span className='text-gray-600 dark:text-gray-400 text-sm block'>{user?.fullName || user?.username}</span>
          </div>
        </div>
        <button className='text-blue-500 text-xs font-semibold'>Switch</button>
      </div>

      {/* Suggestions */}
      <div className='mb-4'>
        <div className='flex justify-between items-center mb-3'>
          <p className='text-gray-500 dark:text-gray-400 font-semibold text-sm'>Suggestions For You</p>
          <Link to="/explore" className='text-xs font-semibold text-black dark:text-white'>See All</Link>
        </div>
        <SuggestedUsers />
      </div>

      {/* Footer */}
      <div className='text-xs text-gray-400 dark:text-gray-500 mt-6'>
        <div className='flex flex-wrap gap-2 mb-4'>
          <span>About</span> • <span>Help</span> • <span>Press</span> •
          <span>API</span> • <span>Jobs</span> • <span>Privacy</span> •
          <span>Terms</span> • <span>Locations</span>
        </div>
        <p>© {new Date().getFullYear()} INSTAGRAM CLONE</p>
      </div>
    </div>
  )
}

export default RightSidebar