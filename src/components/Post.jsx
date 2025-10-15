//frontend/src/components/Post.jsx

import React, { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'
import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    EmailShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    EmailIcon
} from "react-share";
import { useTheme } from '@/contexts/ThemeContext';

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const dispatch = useDispatch();
    const { isDark } = useTheme();

    // États pour la lecture vidéo
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef(null);
    const [isInViewport, setIsInViewport] = useState(false);
    const postRef = useRef(null);

    const shareUrl = `${window.location.origin}/post/${post._id}`;
    const title = `Check out this post by ${post.author.username}`;

    // Observer pour détecter quand le post est dans le viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInViewport(entry.isIntersecting);
            },
            { threshold: 0.6 }
        );

        if (postRef.current) {
            observer.observe(postRef.current);
        }

        return () => {
            if (postRef.current) {
                observer.unobserve(postRef.current);
            }
        };
    }, []);

    // Contrôle de la lecture vidéo automatique
    useEffect(() => {
        if (post.media && post.media[currentMediaIndex]?.type === 'video') {
            const videoElement = videoRef.current;

            if (videoElement && isInViewport) {
                const playPromise = videoElement.play();

                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsVideoPlaying(true);
                            videoElement.muted = true;
                        })
                        .catch(error => {
                            console.log('Auto-play prevented:', error);
                            setIsVideoPlaying(false);
                        });
                }
            } else if (videoElement && !isInViewport) {
                videoElement.pause();
                setIsVideoPlaying(false);
            }
        }
    }, [isInViewport, currentMediaIndex, post.media]);

    const toggleVideoPlay = () => {
        if (post.media && post.media[currentMediaIndex]?.type === 'video') {
            const videoElement = videoRef.current;
            if (videoElement) {
                if (isVideoPlaying) {
                    videoElement.pause();
                } else {
                    videoElement.play();
                }
                setIsVideoPlaying(!isVideoPlaying);
            }
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
        }
    };

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const nextMedia = () => {
        setCurrentMediaIndex((prev) =>
            prev === post.media.length - 1 ? 0 : prev + 1
        );
    }

    const prevMedia = () => {
        setCurrentMediaIndex((prev) =>
            prev === 0 ? post.media.length - 1 : prev - 1
        );
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`https://youguybackend.vercel.app:8001/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Error liking post');
        }
    }

    const commentHandler = async () => {
        try {
            const res = await axios.post(`https://youguybackend.vercel.app:8001/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
            toast.error('Error adding comment');
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`https://youguybackend.vercel.app:8001/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message || 'Error deleting post');
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`https://youguybackend.vercel.app:8001/api/v1/post/${post?._id}/bookmark`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Error bookmarking post');
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
        setShareOpen(false);
    }

    return (

        <div className='my-10 w-full max-w-7xl mx-auto bg-white dark:bg-black border dark:border-gray-700 rounded-lg p-4' ref={postRef}>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                    <Avatar>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-2'>
                        <h1 className='font-semibold'>{post.author?.username}</h1>
                        {user?._id === post.author._id && <Badge variant="secondary">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {post?.author?._id !== user?._id && (
                            <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">
                                Unfollow
                            </Button>
                        )}
                        <Button variant='ghost' className="cursor-pointer w-fit">Add to favorites</Button>
                        {user && user?._id === post?.author._id && (
                            <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit text-red-600">
                                Delete
                            </Button>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Affichage des médias avec navigation simple */}
            {post.media && post.media.length > 0 && (
                <div className='relative mb-4'>
                    {post.media[currentMediaIndex].type === 'video' ? (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                src={post.media[currentMediaIndex].url}
                                className='w-full aspect-square object-cover rounded-lg'
                                loop
                                playsInline
                                muted
                                preload="auto"
                                onClick={toggleVideoPlay}
                                onError={(e) => {
                                    console.error('Error loading video:', e);
                                    setIsVideoPlaying(false);
                                }}
                                onEnded={() => setIsVideoPlaying(false)}
                            />
                            {/* Overlay de contrôle */}
                            {!isVideoPlaying && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                                    onClick={toggleVideoPlay}
                                >
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            {/* Indicateur de son */}
                            {isVideoPlaying && (
                                <button
                                    onClick={toggleMute}
                                    className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    {videoRef.current?.muted ? '🔇' : '🔊'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <img
                            src={post.media[currentMediaIndex].url}
                            alt="post_media"
                            className='w-full aspect-square object-cover rounded-lg'
                        />
                    )}

                    {/* Navigation pour plusieurs médias */}
                    {post.media.length > 1 && (
                        <>
                            <button
                                onClick={prevMedia}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextMedia}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                            >
                                <ChevronRight size={20} />
                            </button>

                            {/* Indicateurs de position */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                {post.media.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Compteur */}
                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                {currentMediaIndex + 1} / {post.media.length}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-4'>
                    {liked ? (
                        <FaHeart
                            onClick={likeOrDislikeHandler}
                            size={24}
                            className='cursor-pointer text-red-600'
                        />
                    ) : (
                        <FaRegHeart
                            onClick={likeOrDislikeHandler}
                            size={22}
                            className='cursor-pointer hover:text-gray-600'
                        />
                    )}

                    <MessageCircle
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        className='cursor-pointer hover:text-gray-600'
                    />

                    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                        <DialogTrigger asChild>
                            <Share2 className='cursor-pointer hover:text-gray-600' />
                        </DialogTrigger>
                        <DialogContent className="flex flex-col items-center text-sm text-center">
                            <h3 className="text-lg font-semibold mb-4">Share this post</h3>
                            <div className="flex gap-4 mb-4">
                                <FacebookShareButton url={shareUrl} quote={title}>
                                    <FacebookIcon size={40} round />
                                </FacebookShareButton>
                                <TwitterShareButton url={shareUrl} title={title}>
                                    <TwitterIcon size={40} round />
                                </TwitterShareButton>
                                <WhatsappShareButton url={shareUrl} title={title}>
                                    <WhatsappIcon size={40} round />
                                </WhatsappShareButton>
                                <EmailShareButton url={shareUrl} subject={title}>
                                    <EmailIcon size={40} round />
                                </EmailShareButton>
                            </div>
                            <div className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={copyToClipboard}
                                >
                                    Copy Link
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <Bookmark
                    onClick={bookmarkHandler}
                    className='cursor-pointer hover:text-gray-600'
                />
            </div>

            <span className='font-medium block mb-2'>{postLike} likes</span>

            {post.caption && (
                <p className='mb-3'>
                    <span className='font-medium mr-2'>{post.author?.username}</span>
                    {post.caption}
                </p>
            )}

            {comment.length > 0 && (
                <span
                    onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }}
                    className='cursor-pointer text-sm text-gray-400 mb-3 block'
                >
                    View all {comment.length} comments
                </span>
            )}

            <CommentDialog open={open} setOpen={setOpen} />

            <div className='flex items-center justify-between border-t pt-3'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full bg-white dark:bg-black'
                />
                {text && (
                    <span
                        onClick={commentHandler}
                        className='text-[#3BADF8] cursor-pointer font-medium'
                    >
                        Post
                    </span>
                )}
            </div>
        </div>

    )
}

export default Post