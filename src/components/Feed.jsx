import React from 'react'
import Posts from './Posts'
import { useTheme } from '@/contexts/ThemeContext';

const Feed = () => {
  const { isDark } = useTheme();
  
  return (
   <div className="w-full overflow-hidden bg-white dark:bg-black">
      <div className="mx-auto w-full md:max-w-[470px]">
        <Posts />
      </div>
    </div>
  )
}

export default Feed