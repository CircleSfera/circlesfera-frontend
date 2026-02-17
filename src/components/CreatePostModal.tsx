import { Music as MusicIcon, Star } from 'lucide-react';
import { useCreatePost } from '../hooks/useCreatePost';
import PhotoEditor from './PhotoEditor';
import MusicPicker from './MusicPicker';
import { parseFilter } from '../utils/styleUtils';
import { Trash2 } from 'lucide-react';

// Step Components
import StoryComposer from './story/StoryComposer';
import UploadStep from './create-post/UploadStep';
import EditStep from './create-post/EditStep';
import CaptionStep from './create-post/CaptionStep';

  /* ... imports ... */

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                  <div className="p-4 border-b border-white/10 flex items-center gap-4">
                       <button type="button" onClick={() => setSubScreen('none')} className="text-white hover:text-gray-300">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                           </svg>
                       </button>
                       <h2 className="font-bold text-lg">Add Location</h2>
                  </div>
                  <div className="p-4">
                      <div className="relative">
                          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input 
                            type="text" 
                            placeholder="Find a location" 
                            className="w-full bg-neutral-800 border-none rounded-lg py-2.5 pl-10 text-white placeholder-gray-500 focus:ring-1 focus:ring-white/20"
                            autoFocus
                          />
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                      {['New York, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan', 'Dubai, UAE'].map(loc => (
                          <button type="button" 
                            key={loc}
                            onClick={() => { setLocation(loc); setSubScreen('none'); }}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0"
                          >
                              <div className="font-medium text-white">{loc}</div>
                              <div className="text-xs text-gray-500">Popular Location</div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  if (subScreen === 'accessibility') {
     return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                           <button type="button" onClick={() => setSubScreen('none')} className="text-white hover:text-gray-300">
                               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                               </svg>
                           </button>
                           <h2 className="font-bold text-lg">Accessibility</h2>
                       </div>
                       <button type="button" onClick={() => setSubScreen('none')} className="text-blue-400 font-bold hover:text-blue-300">Done</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      <p className="text-gray-400 text-sm">Alt text describes your photos for people with visual impairments. It will be created automatically if you don't write it yourself.</p>
                      {mediaFiles.map((item, idx) => (
                          <div key={idx} className="flex gap-4">
                              <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 border border-white/10 relative group">
                                   {item.type === 'video' ? (
                                       (() => {
                                           const { className, style } = parseFilter(item.filter);
                                           return <video src={item.url} className={`w-full h-full object-cover ${className}`} style={style} muted />;
                                       })()
                                   ) : (
                                       (() => {
                                           const { className, style } = parseFilter(item.filter);
                                           return <img src={item.url} alt="" className={`w-full h-full object-cover ${className}`} style={style} />;
                                       })()
                                   )}
                                   <button type="button"
                                     onClick={() => handleRemoveFile(idx)}
                                     className="absolute top-1 right-1 w-6 h-6 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80 hover:scale-110 active:scale-95 z-10 border border-white/5"
                                   >
                                     <Trash2 size={12} strokeWidth={2.5} />
                                   </button>
                              </div>
                              <div className="flex-1">
                                  <input 
                                    type="text" 
                                    value={altTextMap[idx] || ''}
                                    onChange={(e) => setAltTextMap(prev => ({...prev, [idx]: e.target.value}))}
                                    placeholder="Write alt text..." 
                                    className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                                  />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
     )
  }

  if (subScreen === 'advanced') {
      return (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  <div className="p-4 border-b border-white/10 flex items-center gap-4">
                       <button type="button" onClick={() => setSubScreen('none')} className="text-white hover:text-gray-300">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                           </svg>
                       </button>
                       <h2 className="font-bold text-lg">Advanced Settings</h2>
                  </div>
                  <div className="p-4 space-y-6">
                      <div className="flex items-center justify-between">
                          <div>
                              <div className="font-medium text-white">Hide like and view counts</div>
                              <div className="text-xs text-gray-400 mt-1 max-w-[280px]">Only you will see the total number of likes and views on this post.</div>
                          </div>
                          <div 
                            onClick={() => setHideLikes(!hideLikes)}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${hideLikes ? 'bg-blue-500' : 'bg-neutral-700'}`}
                          >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${hideLikes ? 'left-7' : 'left-1'}`}/>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                          <div>
                              <div className="font-medium text-white">Turn off commenting</div>
                              <div className="text-xs text-gray-400 mt-1 max-w-[280px]">You can change this later by going to the ... menu at the top of your post.</div>
                          </div>
                          <div 
                            onClick={() => setTurnOffComments(!turnOffComments)}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${turnOffComments ? 'bg-blue-500' : 'bg-neutral-700'}`}
                          >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${turnOffComments ? 'left-7' : 'left-1'}`}/>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
      );
  }

  // --- Main Modal Content ---
  
  // const [showMusicPicker, setShowMusicPicker] = React.useState(false); // Removed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className={`bg-neutral-900/90 backdrop-blur-2xl border border-white/5 w-full ${step === 'caption' ? 'max-w-4xl h-[75vh]' : 'max-w-md max-h-[85vh] h-full'} rounded-2xl overflow-hidden shadow-3xl flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) relative`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
          <button type="button" 
            onClick={reset}
            className="text-white hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-bold text-lg">
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
