import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext';

const SuggestedProfiles = () => {
    const [suggestedProfiles, setSuggestedProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [followingStates, setFollowingStates] = useState({})
    const { user } = useSelector(store => store.auth)
    const { isDark } = useTheme();

    useEffect(() => {
        const fetchSuggestedProfiles = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await axios.get(`https://youguybackend.vercel.app/api/v1/user/suggested-profiles`, {
                    withCredentials: true
                })

                if (res.data.success) {
                    setSuggestedProfiles(res.data.suggestedUsers)

                    // Initialiser l'état de suivi pour chaque profil
                    const initialFollowingStates = {}
                    res.data.suggestedUsers.forEach(profile => {
                        initialFollowingStates[profile._id] = user?.following?.includes(profile._id) || false
                    })
                    setFollowingStates(initialFollowingStates)
                } else {
                    setError('Failed to load suggestions')
                }
            } catch (error) {
                console.error('Error fetching suggested profiles:', error)
                setError('Failed to load suggestions')
                // Fallback: utiliser les utilisateurs suggérés de base si l'API échoue
                try {
                    const fallbackRes = await axios.get(`https://youguybackend.vercel.app/api/v1/user/suggested`, {
                        withCredentials: true
                    })
                    if (fallbackRes.data.success) {
                        const fallbackUsers = fallbackRes.data.users.slice(0, 5)
                        setSuggestedProfiles(fallbackUsers)

                        // Initialiser l'état de suivi pour les utilisateurs de fallback
                        const initialFollowingStates = {}
                        fallbackUsers.forEach(profile => {
                            initialFollowingStates[profile._id] = user?.following?.includes(profile._id) || false
                        })
                        setFollowingStates(initialFollowingStates)
                    }
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError)
                }
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchSuggestedProfiles()
        }
    }, [user])

    const followUser = async (userId) => {
        try {
            const res = await axios.post(`https://youguybackend.vercel.app/api/v1/user/followorunfollow/${userId}`, {}, {
                withCredentials: true
            })

            if (res.data.success) {
                // Mettre à jour l'état local pour refléter le changement
                setFollowingStates(prev => ({
                    ...prev,
                    [userId]: !prev[userId]
                }))

                toast.success(res.data.message)
            }
        } catch (error) {
            console.error('Error following user:', error)
            toast.error(error.response?.data?.message || 'Failed to follow user')
        }
    }

    if (loading) {
        return (
            <div className="flex overflow-x-auto gap-4 py-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-24 animate-pulse">
                        <div className="rounded-full h-16 w-16 bg-gray-200 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded mt-2"></div>
                        <div className="h-8 bg-gray-200 rounded mt-2"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error || suggestedProfiles.length === 0) {
        return null
    }




    return (
        <div className="mb-2 px-4">
            <div className="flex overflow-x-auto gap-6 pb-4">
                {suggestedProfiles.map(profile => {
                    const isFollowing = followingStates[profile._id] || false

                    return (
                        <div key={profile._id} className="flex-shrink-0 w-28 text-center">
                            <Link to={`/profile/${profile._id}`}>
                                <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-white dark:border-gray-800">
                                    <AvatarImage src={profile.profilePicture} alt={profile.username} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                                        {profile.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <Link to={`/profile/${profile._id}`}>
                                <p className="text-sm font-medium truncate text-black dark:text-white">{profile.username}</p>
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                {profile.followers?.length || 0} followers
                            </p>
                            <Button
                                className="mt-1 h-7 text-xs px-3"
                                onClick={() => followUser(profile._id)}
                                variant={isFollowing ? "secondary" : "outline"}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default SuggestedProfiles