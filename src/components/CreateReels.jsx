import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, X, ChevronLeft, ChevronRight, Play, Pause, Upload } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setReels } from '@/redux/reelSlice';
import { useTheme } from '@/contexts/ThemeContext';

const CreateReel = ({ open, setOpen }) => {
  const fileRef = useRef();
  const videoRefs = useRef([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingVideos, setPlayingVideos] = useState({});
  const { user } = useSelector(store => store.auth);
  const { reels } = useSelector(store => store.reel);
  const dispatch = useDispatch();
   const { theme, toggleTheme } = useTheme(); // Assuming you have a theme slice

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

  // Réinitialiser l'état lorsque le dialog est fermé
  useEffect(() => {
    if (!open) {
      // Nettoyer les URLs blob
      previews.forEach(preview => {
        if (preview.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
      
      // Réinitialiser l'état
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

    if (files.length + selectedFiles.length > 10) {
      toast.error('Maximum 10 fichiers autorisés');
      return;
    }

    const newFiles = [];
    const newPreviews = [];

    for (const file of selectedFiles) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max 100MB)`);
        continue;
      }

      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`Le fichier ${file.name} n'est pas une image ou une vidéo`);
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
    
    // Si c'est le premier fichier ajouté, définir l'index sur 0
    if (files.length === 0 && newFiles.length > 0) {
      setCurrentIndex(0);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Nettoyer l'URL
    if (newPreviews[index]?.url) {
      URL.revokeObjectURL(newPreviews[index].url);
    }
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    
    if (currentIndex >= newPreviews.length && newPreviews.length > 0) {
      setCurrentIndex(newPreviews.length - 1);
    } else if (newPreviews.length === 0) {
      setCurrentIndex(0);
    }
  };

  const navigateMedia = (direction) => {
    // Mettre en pause la vidéo courante
    if (previews[currentIndex]?.type === 'video' && playingVideos[currentIndex]) {
      toggleVideoPlayback(currentIndex);
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
          console.error("Erreur de lecture vidéo:", error);
          toast.error("Impossible de lire la vidéo");
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

  const createReelHandler = async () => {
    if (!files.length) {
      toast.error('Veuillez sélectionner au moins un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8001/api/v1/reel/addreel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.data.success) {
        dispatch(setReels([res.data.reel, ...reels]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du reel');
    } finally {
      setLoading(false);
    }
  };

  const currentPreview = previews[currentIndex];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
        <DialogHeader className='text-center font-semibold'>Créer un nouveau Reel</DialogHeader>

        <div className='flex gap-3 items-center mb-4'>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="avatar" />
            <AvatarFallback className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}>
              {user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-sm'>{user?.username}</h1>
          </div>
        </div>

        {previews.length > 0 ? (
          <div className="relative mb-4 h-80 md:h-96 bg-black rounded-lg flex items-center justify-center">
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
                      console.error("Erreur de chargement de l'image");
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {previews.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
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
                    if (previews[currentIndex]?.type === 'video' && playingVideos[currentIndex]) {
                      toggleVideoPlayback(currentIndex);
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
                className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
              >
                <Pause size={16} />
              </button>
            )}
          </div>
        ) : (
          <div 
            className={`border-2 border-dashed rounded-lg h-80 md:h-96 flex flex-col items-center justify-center mb-4 cursor-pointer transition-colors ${
              theme === 'dark' 
                ? 'border-gray-600 hover:border-gray-400' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => fileRef.current.click()}
          >
            <div className="text-center p-4">
              <Upload size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className="text-lg font-semibold">Glissez-déposez vos photos et vidéos ici</p>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ou sélectionnez depuis votre appareil</p>
              <Button className="mt-4 bg-[#0095F6] hover:bg-[#258bcf]">
                Sélectionner des fichiers
              </Button>
            </div>
          </div>
        )}

        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={`focus-visible:ring-transparent mb-4 resize-none ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-black placeholder-gray-500'
          }`}
          placeholder="Écrivez une légende..."
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

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => fileRef.current.click()}
            className="flex-1 bg-[#0095F6] hover:bg-[#258bcf]"
            variant="outline"
          >
            {previews.length > 0 ? 'Ajouter plus de fichiers' : 'Sélectionner des fichiers'}
          </Button>

          {previews.length > 0 && (
            loading ? (
              <Button className="flex-1" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication...
              </Button>
            ) : (
              <Button onClick={createReelHandler} className="flex-1">
                Partager le Reel ({previews.length} {previews.length === 1 ? 'fichier' : 'fichiers'})
              </Button>
            )
          )}
        </div>

        {previews.length > 0 && (
          <p className={`text-xs text-center mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {previews.length} fichier(s) sélectionné(s) • Maximum 10 fichiers
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateReel;