import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import { useTheme } from '@/contexts/ThemeContext';

const CreatePost = ({ open, setOpen }) => {
  const fileRef = useRef();
  const videoRefs = useRef([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingVideos, setPlayingVideos] = useState({});
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Nettoyer les URLs lorsqu'on ferme le dialog
  useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (preview.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previews]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Nettoyer les URLs avant de reset
      previews.forEach(preview => {
        if (preview.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
      
      setFiles([]);
      setPreviews([]);
      setCaption('');
      setCurrentIndex(0);
      setPlayingVideos({});
    }
  }, [open]);

  const fileChangeHandler = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    // Limiter à 10 fichiers maximum
    if (files.length + selectedFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    const newFiles = [];
    const newPreviews = [];

    for (const file of selectedFiles) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 100MB)`);
        continue;
      }

      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`File ${file.name} is not an image or video`);
        continue;
      }

      newFiles.push(file);
      
      // Créer l'URL pour la prévisualisation
      const dataUrl = URL.createObjectURL(file);
      newPreviews.push({
        url: dataUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        file: file
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Clean up URL objects to prevent memory leaks
    if (newPreviews[index]?.url) {
      URL.revokeObjectURL(newPreviews[index].url);
    }
    
    // Mettre en pause la vidéo si elle est en cours de lecture
    if (newPreviews[index]?.type === 'video' && playingVideos[index]) {
      const video = videoRefs.current[index];
      if (video) {
        video.pause();
      }
    }
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    
    // Adjust current index if needed
    if (currentIndex >= newPreviews.length && newPreviews.length > 0) {
      setCurrentIndex(newPreviews.length - 1);
    } else if (newPreviews.length === 0) {
      setCurrentIndex(0);
    }

    // Mettre à jour l'état des vidéos en lecture
    const newPlayingVideos = { ...playingVideos };
    delete newPlayingVideos[index];
    setPlayingVideos(newPlayingVideos);
  };

  const navigateMedia = (direction) => {
    // Mettre en pause la vidéo courante si elle est en lecture
    if (previews[currentIndex]?.type === 'video' && playingVideos[currentIndex]) {
      const video = videoRefs.current[currentIndex];
      if (video) {
        video.pause();
        setPlayingVideos(prev => ({ ...prev, [currentIndex]: false }));
      }
    }

    if (direction === 'prev') {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : previews.length - 1));
    } else {
      setCurrentIndex(prev => (prev < previews.length - 1 ? prev + 1 : 0));
    }
  };

  const toggleVideoPlayback = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play().catch(error => {
          console.error("Video playback error:", error);
          toast.error("Unable to play video");
        });
        setPlayingVideos(prev => ({ ...prev, [index]: true }));
      } else {
        video.pause();
        setPlayingVideos(prev => ({ ...prev, [index]: false }));
      }
    }
  };

  const handleVideoEnded = (index) => {
    setPlayingVideos(prev => ({ ...prev, [index]: false }));
  };

  const createPostHandler = async () => {
    if (!files.length && !caption.trim()) {
      toast.error('Add a caption or select files');
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      setLoading(true);
      const res = await axios.post('https://youguybackend.vercel.app:8001/api/v1/post/addpost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const currentPreview = previews[currentIndex];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
        <DialogHeader className='text-center font-semibold'>Create New Post</DialogHeader>

        <div className='flex gap-3 items-center mb-4'>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="avatar" />
            <AvatarFallback>{user?.username?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-sm'>{user?.username}</h1>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bio here...</span>
          </div>
        </div>

        {previews.length > 0 ? (
          <div className="relative mb-4 h-96 bg-black rounded-lg flex items-center justify-center">
            {previews.map((preview, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {preview.type === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={el => (videoRefs.current[index] = el)}
                      src={preview.url}
                      className="max-h-full max-w-full object-contain"
                      controls={false}
                      muted
                      onPlay={() => setPlayingVideos(prev => ({ ...prev, [index]: true }))}
                      onPause={() => setPlayingVideos(prev => ({ ...prev, [index]: false }))}
                      onEnded={() => handleVideoEnded(index)}
                      preload="metadata"
                    />
                    {!playingVideos[index] && (
                      <button
                        onClick={() => toggleVideoPlayback(index)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity"
                      >
                        <div className="bg-black bg-opacity-50 rounded-full p-3">
                          <Play size={32} className="text-white" />
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <img
                    src={preview.url}
                    alt={`preview-${index}`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      console.error("Image loading error");
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {previews.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {previews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Mettre en pause la vidéo courante si on change de média
                    if (previews[currentIndex]?.type === 'video' && playingVideos[currentIndex]) {
                      const video = videoRefs.current[currentIndex];
                      if (video) {
                        video.pause();
                        setPlayingVideos(prev => ({ ...prev, [currentIndex]: false }));
                      }
                    }
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white scale-125' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {currentPreview?.type === 'video' && playingVideos[currentIndex] && (
              <button
                onClick={() => toggleVideoPlayback(currentIndex)}
                className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              >
                <Pause size={16} />
              </button>
            )}
          </div>
        ) : (
          <div 
            className={`border-2 border-dashed rounded-lg h-96 flex flex-col items-center justify-center mb-4 cursor-pointer transition-colors ${
              theme === 'dark' 
                ? 'border-gray-700 hover:border-gray-600' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => fileRef.current.click()}
          >
            <div className="text-center p-4">
              <p className="text-lg font-semibold">Drag photos and videos here</p>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Or select from your device
              </p>
              <Button className="mt-4 bg-[#0095F6] hover:bg-[#258bcf]">
                Select from device
              </Button>
            </div>
          </div>
        )}

        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={`focus-visible:ring-transparent border-none mb-4 resize-none ${
            theme === 'dark' 
              ? 'bg-gray-800 text-white placeholder-gray-400' 
              : 'bg-white text-black placeholder-gray-500'
          }`}
          placeholder="Write a caption..."
          rows={3}
        />

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={fileChangeHandler}
          multiple
        />

        <div className="flex gap-2">
          <Button
            onClick={() => fileRef.current.click()}
            className={`flex-1 bg-[#0095F6] hover:bg-[#258bcf] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}`}
            variant="outline"
          >
            {previews.length > 0 ? 'Add more files' : 'Select files'}
          </Button>

          {(files.length > 0 || caption.trim()) && (
            loading ? (
              <Button className="flex-1" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </Button>
            ) : (
              <Button onClick={createPostHandler} className="flex-1">
                Post {files.length > 0 ? `(${files.length} ${files.length === 1 ? 'file' : 'files'})` : ''}
              </Button>
            )
          )}
        </div>

        {files.length > 0 && (
          <p className={`text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {files.length} file(s) selected • Max 10 files
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;