import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, storiesApi } from '../services'; 
import type { CreatePostDto, CreateStoryDto, Audio as AudioTrack } from '../types';
import { logger } from '../utils/logger';

export type CreateMode = 'POST' | 'STORY' | 'FRAME';
export type Step = 'upload' | 'edit' | 'caption';
export type SubScreen = 'none' | 'location' | 'accessibility' | 'advanced';

export interface MediaFile {
  file: File;
  url: string;
  filter?: string;
  type: 'image' | 'video';
  altText?: string;
}

export function useCreatePost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'story' ? 'STORY' : 
                      searchParams.get('mode') === 'frame' ? 'FRAME' : 'POST';
  
  const [mode, setMode] = useState<CreateMode>(initialMode);
  const [step, setStep] = useState<Step>('upload');
  const [subScreen, setSubScreen] = useState<SubScreen>('none');
  
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [hideLikes, setHideLikes] = useState(false);
  const [turnOffComments, setTurnOffComments] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);
  const [isCloseFriendsOnly, setIsCloseFriendsOnly] = useState(false);
  const [altTextMap, setAltTextMap] = useState<Record<number, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostDto) => {
      const res = await api.post('/api/v1/posts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/');
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (data: CreateStoryDto) => {
      return storiesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      navigate('/');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image' as 'image' | 'video',
      }));
      setMediaFiles((prev) => [...prev, ...newFiles]);
      setStep('edit');
    }
  };

  const handleFilterSave = (_: File, filterClass: string) => {
    if (currentEditIndex !== null) {
      setMediaFiles((prev) => {
        const updated = [...prev];
        updated[currentEditIndex] = { ...updated[currentEditIndex], filter: filterClass };
        return updated;
      });
      setCurrentEditIndex(null); 
    }
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setAltTextMap(prev => {
        const updated = { ...prev };
        delete updated[index];
        const newMap: Record<number, string> = {};
        Object.entries(updated).forEach(([key, value]) => {
            const k = parseInt(key);
            if (k > index) newMap[k - 1] = value;
            else newMap[k] = value;
        });
        return newMap;
    });
    
    if (mediaFiles.length <= 1) {
        setStep('upload');
    }
  };

  const handleSubmit = async () => {
    if (mediaFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedMedia = await Promise.all(
        mediaFiles.map(async (item, idx) => {
          const formData = new FormData();
          formData.append('file', item.file);

          try {
            const response = await api.post<{ url: string; type: string }>('/api/v1/uploads', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });

            return {
              url: response.data.url,
              type: response.data.type,
              filter: item.filter,
              altText: altTextMap[idx] || '',
            };
          } catch (error: unknown) {
            logger.error('Upload failed for file:', item.file.name, error);
            const axiosErr = error as { response?: { data?: { message?: string | string[] }; status?: number } };
            const serverMessage = axiosErr.response?.data?.message;
            const displayMessage = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
            
            if (axiosErr.response?.status === 413) {
                throw new Error(`File ${item.file.name} is too large. Max size is 100MB.`);
            }
            throw new Error(displayMessage || `Failed to upload ${item.file.name}`);
          }
        })
      );

      if (mode === 'STORY') {
          await Promise.all(uploadedMedia.map(media => 
             createStoryMutation.mutateAsync({
                 mediaUrl: media.url,
                 mediaType: media.type,
                 isCloseFriendsOnly,
                 audioId: selectedAudio?.id,
             })
          ));
      } else {
          const payload: CreatePostDto = {
            caption,
            location,
            hideLikes,
            turnOffComments,
            media: uploadedMedia,
            type: mode, 
            audioId: selectedAudio?.id,
          };
          await createPostMutation.mutateAsync(payload);
      }
      
    } catch (error: unknown) {
      logger.error('Error creating content:', error);
      const message = error instanceof Error ? error.message : 'Failed to create content. Please try again.';
      alert(message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const reset = () => {
    if (step === 'edit') setStep('upload');
    else if (step === 'caption') setStep('edit');
    else navigate(-1);
  };

  return {
    mode, setMode,
    step, setStep,
    subScreen, setSubScreen,
    mediaFiles, setMediaFiles,
    currentEditIndex, setCurrentEditIndex,
    caption, setCaption,
    location, setLocation,
    hideLikes, setHideLikes,
    turnOffComments, setTurnOffComments,
    selectedAudio, setSelectedAudio,
    isCloseFriendsOnly, setIsCloseFriendsOnly,
    altTextMap, setAltTextMap,
    isUploading,
    fileInputRef,
    handleFileSelect,
    handleFilterSave,
    handleRemoveFile,
    handleSubmit,
    reset,
    isPending: createPostMutation.isPending || createStoryMutation.isPending || isUploading
  };
}
