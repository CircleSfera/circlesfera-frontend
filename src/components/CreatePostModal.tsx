import { Music as MusicIcon, Star } from 'lucide-react';
import { useCreatePost } from '../hooks/useCreatePost';
import PhotoEditor from './PhotoEditor';
import MusicPicker from './MusicPicker';

// Step Components
import StoryComposer from './story/StoryComposer';
import UploadStep from './create-post/UploadStep';
import EditStep from './create-post/EditStep';
import CaptionStep from './create-post/CaptionStep';

// Sub-screen Components
import LocationSubScreen from './create-post/LocationSubScreen';
import AccessibilitySubScreen from './create-post/AccessibilitySubScreen';
import AdvancedSettingsSubScreen from './create-post/AdvancedSettingsSubScreen';

export default function CreatePostModal() {
  const [showMusicPicker, setShowMusicPicker] = React.useState(false); // Moved to top

  const {
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
    // isUploading, // Removed unused
    fileInputRef,
    handleFileSelect,
    handleFilterSave,
    handleRemoveFile,
    handleSubmit,
    reset,
    isPending
  } = useCreatePost();
  
  const isStoryMode = mode === 'STORY';
  const [showStoryComposer, setShowStoryComposer] = React.useState(false);
  const [isComposed, setIsComposed] = React.useState(false);

  // Auto-open composer for new story images
  React.useEffect(() => {
    if (isStoryMode && step === 'edit' && mediaFiles.length > 0 && !isComposed && mediaFiles[0].type === 'image') {
      setShowStoryComposer(true);
    }
  }, [isStoryMode, step, mediaFiles, isComposed]);

  // Reset composed state when restarting
  React.useEffect(() => {
      if (step === 'upload') setIsComposed(false);
  }, [step]);

  const handleComposerSave = async (blob: Blob) => {
      console.log('Composer saved blob:', blob.size, blob.type);
      const file = new File([blob], "story_composed.png", { type: "image/png" });
      const url = URL.createObjectURL(file);
      setMediaFiles([{ file, url, type: 'image' }]);
      setIsComposed(true);
      setShowStoryComposer(false);
      setStep('edit'); // Crucial: move to edit step to show preview
  };

  // --- Sub-screens & Overlays ---

  if (showStoryComposer) {
      return (
          <StoryComposer 
              initialMedia={mediaFiles[0]?.file}
              onClose={() => {
                  // If closing without saving, maybe go back to upload or just show preview?
                  // Let's go back to upload if they cancel the very first edit?
                  // Or just close composer and show raw image.
                  setShowStoryComposer(false);
                  setIsComposed(true); // Don't reopen automatically
              }}
              onPost={handleComposerSave}
          />
      );
  }

  if (currentEditIndex !== null) {
  /* ... */

    return (
      <div className="fixed inset-0 z-50 bg-black">
        <PhotoEditor
          image={mediaFiles[currentEditIndex].file}
          onSave={handleFilterSave}
          onCancel={() => setCurrentEditIndex(null)}
        />
      </div>
    );
  }

  if (subScreen === 'location') {
    return (
      <LocationSubScreen 
        onClose={() => setSubScreen('none')}
        onSelect={(loc) => {
          setLocation(loc);
          setSubScreen('none');
        }}
      />
    );
  }

  if (subScreen === 'accessibility') {
    return (
      <AccessibilitySubScreen 
        mediaFiles={mediaFiles}
        altTextMap={altTextMap}
        setAltTextMap={setAltTextMap}
        onRemoveFile={handleRemoveFile}
        onClose={() => setSubScreen('none')}
      />
    );
  }

  if (subScreen === 'advanced') {
    return (
      <AdvancedSettingsSubScreen 
        hideLikes={hideLikes}
        setHideLikes={setHideLikes}
        turnOffComments={turnOffComments}
        setTurnOffComments={setTurnOffComments}
        onClose={() => setSubScreen('none')}
      />
    );
  }

  // --- Main Modal Content ---
  
  // const [showMusicPicker, setShowMusicPicker] = React.useState(false); // Removed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`bg-neutral-900/90 backdrop-blur-2xl border border-white/5 w-full ${step === 'caption' ? 'max-w-4xl h-[75vh]' : 'max-w-md max-h-[85vh] h-full'} rounded-2xl overflow-hidden shadow-3xl flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) relative`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
          <button type="button" 
            onClick={reset}
            className="text-white hover:text-gray-300"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-bold text-lg" id="modal-title">
            {mode === 'STORY' ? 'Add to Story' : mode === 'FRAME' ? 'New Frame' : 'New Post'}
          </h2>
          <button type="button" 
            onClick={() => {
              if (step === 'edit') {
                  if (isStoryMode) handleSubmit();
                  else setStep('caption');
              }
              else if (step === 'caption') handleSubmit();
            }}
            disabled={isPending || mediaFiles.length === 0}
            className="text-blue-400 font-bold hover:text-blue-300 disabled:opacity-50"
          >
            {step === 'caption' || (isStoryMode && step === 'edit') ? (isPending ? 'Sharing...' : 'Share') : 'Next'}
          </button>
        </div>

        {isStoryMode && step === 'edit' && (
          <div className="flex items-center justify-center gap-3 py-2.5 bg-black/20 backdrop-blur-md border-b border-white/5 animate-in slide-in-from-top-full duration-500 z-20">
            <button type="button"
              onClick={() => setShowMusicPicker(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedAudio ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <MusicIcon size={12} className={selectedAudio ? 'fill-white' : ''} />
              {selectedAudio ? selectedAudio.title : 'Add Music'}
            </button>
            <button type="button"
              onClick={() => setIsCloseFriendsOnly(!isCloseFriendsOnly)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isCloseFriendsOnly ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Star size={12} className={isCloseFriendsOnly ? 'fill-white' : ''} />
              {isCloseFriendsOnly ? 'Close Friends' : 'Your Story'}
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 flex flex-col min-h-[300px] relative ${step === 'edit' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className="absolute inset-0 bg-radial-[at_50%_0%] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
          
          {step === 'upload' && (
            <UploadStep 
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              mode={mode}
              setMode={setMode}
              onTextStory={() => setShowStoryComposer(true)}
            />
          )}

          {step === 'edit' && (
            <EditStep 
              mediaFiles={mediaFiles}
              mode={mode}
              setMode={setMode}
              setCurrentEditIndex={setCurrentEditIndex}
              handleRemoveFile={handleRemoveFile}
              fileInputRef={fileInputRef}
            />
          )}

          {step === 'caption' && (
            <CaptionStep 
              mediaFiles={mediaFiles}
              mode={mode}
              caption={caption}
              setCaption={setCaption}
              location={location}
              setSubScreen={setSubScreen}
              selectedAudio={selectedAudio}
              setSelectedAudio={setSelectedAudio}
              setShowMusicPicker={setShowMusicPicker}
            />
          )}
        </div>
      </div>
      
      {showMusicPicker && (
        <MusicPicker 
          onSelect={(audio) => {
            setSelectedAudio(audio);
            setShowMusicPicker(false);
          }}
          onClose={() => setShowMusicPicker(false)}
        />
      )}
    </div>
  );
}

import React from 'react'; // ensure React is imported for showMusicPicker state usage if needed, though hook has it.
