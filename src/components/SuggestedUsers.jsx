import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';
import { toggleFollowUser } from '@/redux/authSlice';
import { useTheme } from '@/contexts/ThemeContext';

const API_BASE = 'https://youguybackend.vercel.app/api/v1';

const SuggestedUsers = () => {
    const dispatch = useDispatch();
    const { suggestedUsers, user } = useSelector(store => store.auth);
    const { isDark } = useTheme();

    const handleFollow = async (targetId) => {
        try {
            const res = await axios.post(
                `${API_BASE}/user/followorunfollow/${targetId}`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                dispatch(toggleFollowUser(targetId));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Unable to follow user');
        }
    };

    return (
        <div className='my-10'>
            {
                suggestedUsers.map((u) => {
                    const isFollowing = user?.following?.includes(u._id);

                    return (
                        <div key={u._id} className='flex items-center justify-between my-5'>
                            <div className='flex items-center gap-2'>
                                <Link to={`/profile/${u?._id}`}>
                                    <Avatar>
                                        <AvatarImage src={u?.profilePicture} alt="profile_image" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <h1 className='font-semibold text-sm text-black dark:text-white'>
                                        <Link to={`/profile/${u?._id}`}>{u?.username}</Link>
                                    </h1>
                                    <span className='text-gray-600 dark:text-gray-400 text-sm'>{u?.bio || 'Bio here...'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleFollow(u._id)}
                                className={`text-xs font-bold cursor-pointer ${
                                    isFollowing ? 'text-red-500 hover:text-red-600' : 'text-[#3BADF8] hover:text-[#3495d6]'
                                }`}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default SuggestedUsers;