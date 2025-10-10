import { Heart, Home, Video, LogOut, LayoutDashboard, MessageCircle, PlusSquare, Search, TrendingUp, X, Sun, Moon } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import CreateReels from './CreateReels'
import { setReels, setSelectedReel } from '@/redux/reelSlice'
import { Button } from './ui/button'
import { Input } from './ui/input'
import SuggestedUsers from './SuggestedUsers'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

const LeftSidebar = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector(store => store.auth)
    const { likeNotification } = useSelector(store => store.realTimeNotification)
    const { theme, toggleTheme } = useTheme();

    // États pour les dialogues
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const [reelDialogOpen, setReelDialogOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [activeItem, setActiveItem] = useState('Home')



    // Déconnexion
    const logoutHandler = async () => {
        try {
            const res = await axios.get('http://localhost:8001/api/v1/user/logout', { withCredentials: true })
            if (res.data.success) {
                dispatch(setAuthUser(null))
                dispatch(setSelectedPost(null))
                dispatch(setPosts([]))
                dispatch(setSelectedReel(null))
                dispatch(setReels([]))
                navigate("/login")
                toast.success(res.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message)
        }
    }

    // Sidebar actions
    const sidebarHandler = (textType) => {
        setActiveItem(textType)

        if (textType === 'Logout') logoutHandler()
        else if (textType === "Create") setCreateDialogOpen(true) // Ouvrir le dialogue de choix
        else if (textType === "Profile") navigate(`/profile/${user?._id}`)
        else if (textType === "Home") navigate("/")
        else if (textType === 'Messages') navigate("/chat")
        else if (textType === 'Reels') navigate("/reels")
        else if (textType === 'Explore') navigate("/explore")
        else if (textType === 'Search') setSearchOpen(true)
        else if (textType === "Dashboard") navigate("/")
    }

    // Recherche utilisateurs
    const searchUsers = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }
        try {
            setLoading(true)
            const res = await axios.get(`http://localhost:8001/api/v1/user/search?query=${searchQuery}`)
            if (res.data.success) setSearchResults(res.data.users)
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la recherche")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(searchUsers, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery])

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`)
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
    }

    const sidebarItems = [
        { icon: <Home size={24} className="text-current" />, text: "Home" },
        { icon: <Search size={24} className="text-current" />, text: "Search" },
        { icon: <TrendingUp size={24} className="text-current" />, text: "Explore" },
        { icon: <Video size={24} className="text-current" />, text: "Reels" },
        { icon: <MessageCircle size={24} className="text-current" />, text: "Messages" },
        { icon: <Heart size={24} className="text-current" />, text: "Notifications" },
        { icon: <PlusSquare size={24} className="text-current" />, text: "Create" },
        { icon: <LayoutDashboard size={24} className="text-current" />, text: "Dashboard" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut size={24} className="text-current" />, text: "Logout" },
        {
            icon: theme === 'light' ?
                <Moon size={24} className="text-current" /> :
                <Sun size={24} className="text-current" />,
            text: "Theme",
            action: toggleTheme // Utilisez directement toggleTheme du context
        },
    ]

    return (
        <>
            {/* Mobile Top Bar */}
            <div className='md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-black border-b border-gray-300 dark:border-gray-700 text-black dark:text-white flex justify-between items-center px-4 py-3 z-50'>
                <h1 className='font-bold text-xl text-black dark:text-white'>
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{
                            width: '150px',
                            height: 'auto',
                            maxWidth: '100%' // Pour le responsive
                        }}
                    /></h1>
                <div className='flex items-center gap-4'>
                    <div onClick={() => sidebarHandler("Search")} className='cursor-pointer text-black dark:text-white'>
                        <Search size={24} />
                    </div>
                    <div onClick={() => sidebarHandler("Notifications")} className='cursor-pointer relative text-black dark:text-white'>
                        <Heart size={24} />
                        {likeNotification.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {likeNotification.length}
                            </span>
                        )}
                    </div>
                    <div onClick={toggleTheme} className='cursor-pointer text-black dark:text-white'>
                        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-300 dark:border-gray-700 flex justify-around items-center py-3 z-40">
                {sidebarItems.filter(item =>
                    ["Home", "Messages", "Reels", "Explore", "Create", "Dashboard", "Profile"].includes(item.text)
                ).map((item, index) => (
                    <div
                        onClick={() => { if (item.action) item.action(); else sidebarHandler(item.text) }}
                        key={index}
                        className={`cursor-pointer ${activeItem === item.text ? "text-black dark:text-white" : "text-gray-500 dark:text-white"}`}
                    >
                        {item.icon}
                    </div>
                ))}

                {/* Bouton thème en bottom nav */}
                <div onClick={toggleTheme} className='cursor-pointer text-black dark:text-white'>
                    {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className={`hidden md:flex fixed top-0 left-10 h-screen flex-col bg-white dark:bg-black border-r border-gray-300 dark:border-gray-700 transition-all duration-300
                ${searchOpen ? 'w-16' : 'w-[16%]'}
            `}>
                <h1 className='pl-3 font-bold text-xl text-black dark:text-white'>{searchOpen ? '' :
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{
                            width: '100px',
                            height: 'auto',
                            maxWidth: '100%' // Pour le responsive
                        }}
                    />}</h1>
                <div className='flex flex-col flex-grow'>
                    {sidebarItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => { if (item.action) item.action(); else sidebarHandler(item.text) }}
                            className='flex items-center gap-3 relative hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-lg p-3 my-1 text-black dark:text-white'
                        >
                            {item.icon}
                            {!searchOpen && <span className='hidden lg:inline'>{item.text}</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Search Overlay */}
            {searchOpen && (
                <div className='fixed inset-0 z-50 flex'>
                    <div
                        className='bg-black bg-opacity-50 w-full h-full'
                        onClick={() => {
                            setSearchOpen(false)
                            setSearchQuery('')
                            setSearchResults([])
                        }}
                    />
                    <div className='absolute md:left-16 left-0 top-0 w-full md:w-80 h-screen bg-white dark:bg-gray-900 shadow-lg z-50'>
                        <div className='p-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center'>
                            <h2 className='font-bold text-lg text-black dark:text-white'>Rechercher des utilisateurs</h2>
                            <button
                                onClick={() => {
                                    setSearchOpen(false)
                                    setSearchQuery('')
                                    setSearchResults([])
                                }}
                                className='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-white'
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className='p-4'>
                            <Input
                                placeholder="Rechercher par nom ou pseudo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='mb-4 bg-white dark:bg-gray-800 text-black dark:text-white'
                                autoFocus
                            />
                            {loading ? (
                                <div className='flex justify-center py-4 text-black dark:text-white'>Chargement...</div>
                            ) : searchResults.length > 0 ? (
                                <div className='space-y-2'>
                                    {searchResults.map((u) => (
                                        <div
                                            key={u._id}
                                            onClick={() => handleUserClick(u._id)}
                                            className='flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-black dark:text-white'
                                        >
                                            <Avatar>
                                                <AvatarImage src={u.profilePicture} />
                                                <AvatarFallback>{u.username.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className='font-semibold'>{u.username}</p>
                                                <p className='text-sm text-gray-600 dark:text-gray-400'>{u.fullName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery ? (
                                <p className='text-center py-4 text-gray-500 dark:text-gray-400'>Commencez à taper pour rechercher</p>
                            ) : (
                                <div className='mb-4'>
                                    <div className='flex justify-between items-center mb-3'>
                                        <p className='text-gray-500 dark:text-gray-400 font-semibold text-sm'>Suggestions For You</p>
                                        <Link to="/explore" className='text-xs font-semibold text-black dark:text-white'>See All</Link>
                                    </div>
                                    <SuggestedUsers />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Dialogue pour choisir entre Post et Reel */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center">Create New</DialogHeader>
                    <div className="flex flex-col gap-4 p-4">
                        <Button
                            onClick={() => {
                                setCreateDialogOpen(false);
                                setPostDialogOpen(true); // Ouvrir le dialogue de création de post
                            }}
                            className="w-full"
                        >
                            Create Post
                        </Button>
                        <Button
                            onClick={() => {
                                setCreateDialogOpen(false);
                                setReelDialogOpen(true); // Ouvrir le dialogue de création de reel
                            }}
                            className="w-full"
                            variant="outline"
                        >
                            Create Reel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Composants de création */}
            <CreatePost open={postDialogOpen} setOpen={setPostDialogOpen} />
            <CreateReels open={reelDialogOpen} setOpen={setReelDialogOpen} />
        </>
    )
}

export default LeftSidebar