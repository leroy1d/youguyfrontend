import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useTheme } from '@/contexts/ThemeContext';

const Comment = ({ comment }) => {
    const { theme } = useTheme();
    
    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center'>
                <Avatar>
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h1 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {comment?.author.username} 
                    <span className={`font-normal pl-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {comment?.text}
                    </span>
                </h1>
            </div>
        </div>
    )
}

export default Comment