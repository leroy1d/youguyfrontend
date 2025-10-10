import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'
import { useTheme } from '@/contexts/ThemeContext';

const Posts = () => {
  const { posts } = useSelector(store => store.post);
  const { isDark } = useTheme();
  
  return (
    <div className="space-y-10 bg-white dark:bg-black">
      {posts.map((post) => (
        <div key={post._id} className="max-w-7xl mx-auto">
          <Post post={post} />
        </div>
      ))}
    </div>
  )
}

export default Posts