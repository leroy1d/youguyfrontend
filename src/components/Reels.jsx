import React from 'react'
import Reel from './Reel'
import { useSelector } from 'react-redux'
import { useTheme } from '@/contexts/ThemeContext';

const Reels = () => {
  const { reels } = useSelector(store => store.reel || { reels: [] });
  const { isDark } = useTheme();

  return (
    <div className="w-full overflow-hidden bg-white dark:bg-black">
      <div className="mx-auto w-full md:max-w-[470px]">
        {reels.length > 0 ? (
          reels.map((reel) => (
            <div key={reel._id} className="max-w-7xl mx-auto">
              <Reel reel={reel} />
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">No reels yet. Create your first reel!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reels