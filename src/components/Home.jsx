// Home.jsx
import React from 'react'
import Feed from './Feed'
import RightSidebar from './RightSidebar'
import SuggestedProfiles from './SuggestedProfiles'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'
import { useSelector } from 'react-redux'
import { useTheme } from '@/contexts/ThemeContext';

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    const { isDark } = useTheme();

    const { suggestedUsers = [] } = useSelector(store => store.user) || {};

    return (
        <div className={`relative flex w-900 justify-center min-h-screen overflow-hidden bg-white dark:bg-black`}>
            <div className="flex w-900 max-w-[1000px]">
                <div className="hidden md:block w-0 flex-shrink-0"></div>

                {/* Conteneur principal avec suppression de scroll */}
                <div className={`flex-grow mt-5 w-full overflow-hidden`}>
                    {/* Section des profils suggérés */}
                    <SuggestedProfiles />
                    
                    <Feed />
                </div>

                <div className={`hidden lg:block w-10 flex-shrink-`}>
                    <RightSidebar suggestedUsers={suggestedUsers} />
                </div>
            </div>
        </div>
    )
}

export default Home