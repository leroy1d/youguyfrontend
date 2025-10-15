import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import axios from 'axios';
import { toast } from 'sonner';
import { toggleFollowUser } from '@/redux/authSlice';
import { useTheme } from '@/contexts/ThemeContext';

const API_BASE = 'https://youguybackend.vercel.app:8001/api/v1';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = useMemo(() => {
    if (!user || !userProfile) return false;
    return (user.following || []).includes(userProfile._id);
  }, [user, userProfile]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const handleToggleFollow = async () => {
    if (!userProfile?._id) return;
    try {
      const res = await axios.post(`${API_BASE}/user/followorunfollow/${userProfile._id}`, {}, { withCredentials: true });
      if (res.data.success) {
        dispatch(toggleFollowUser(userProfile._id));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Action failed');
    }
  };

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10 bg-white dark:bg-black min-h-screen'>
      <div className='flex flex-col gap-20 p-8 w-full'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5 text-black dark:text-white'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-xl font-semibold'>{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 dark:hover:bg-gray-700 h-8'>Edit profile</Button></Link>
                      <Button variant='secondary' className='hover:bg-gray-200 dark:hover:bg-gray-700 h-8'>View archive</Button>
                      <Button variant='secondary' className='hover:bg-gray-200 dark:hover:bg-gray-700 h-8'>Ad tools</Button>
                    </>
                  ) : (
                    isFollowing ? (
                      <>
                        <Button onClick={handleToggleFollow} variant='secondary' className='h-8'>Unfollow</Button>
                        <Button variant='secondary' className='h-8'>Message</Button>
                      </>
                    ) : (
                      <Button onClick={handleToggleFollow} className='bg-[#0095F6] hover:bg-[#3192d2] h-8'>Follow</Button>
                    )
                  )
                }
              </div>
              <div className='flex items-center gap-4'>
                <p><span className='font-semibold'>{userProfile?.posts?.length || 0} </span>posts</p>
                <p><span className='font-semibold'>{userProfile?.followers?.length || 0} </span>followers</p>
                <p><span className='font-semibold'>{userProfile?.following?.length || 0} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span> </Badge>
                <span>🤯Learn code with patel mernstack style</span>
                <span>🤯Turing code into fun</span>
                <span>🤯DM for collaboration</span>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200 dark:border-t-gray-700'>
          <div className='flex items-center justify-center gap-10 text-sm text-black dark:text-white'>
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold border-t-2 border-black dark:border-white' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold border-t-2 border-black dark:border-white' : ''}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'reels' ? 'font-bold border-t-2 border-black dark:border-white' : ''}`} onClick={() => handleTabChange('reels')}>
              REELS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'tags' ? 'font-bold border-t-2 border-black dark:border-white' : ''}`} onClick={() => handleTabChange('tags')}>
              TAGS
            </span>
          </div>
          <div className='grid grid-cols-3 gap-1 mt-4'>
            {
             displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='relative group cursor-pointer'>
                    <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <div className='flex items-center text-white space-x-4'>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <Heart />
                          <span>{post?.likes?.length || 0}</span>
                        </button>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <MessageCircle />
                          <span>{post?.comments?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile