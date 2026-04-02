import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music as MusicIcon, Star, ChevronLeft, Loader2 } from 'lucide-react';
import { useCreatePost } from '../hooks/useCreatePost';
import PhotoEditor from './PhotoEditor';
import MusicPicker from './MusicPicker';
import ProgressStepper from './create-post/ProgressStepper';

// Step Components
import StoryComposer from './story/StoryComposer';
import UploadStep from './create-post/UploadStep';
import EditStep from './create-post/EditStep';
import CaptionStep from './create-post/CaptionStep';

// Sub-screen Components
import LocationSubScreen from './create-post/LocationSubScreen';
import AccessibilitySubScreen from './create-post/AccessibilitySubScreen';
import AdvancedSettingsSubScreen from './create-post/AdvancedSettingsSubScreen';

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const STEP_ORDER = ['upload', 'edit', 'caption'] as const;

export default function CreatePostModal() {
  const [showMusicPicker, setShowMusicPicker] = React.useState(false);
  const [stepDirection, setStepDirection] = React.useState(1);

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
    isPremium, setIsPremium,
    price, setPrice,
    altTextMap, setAltTextMap,
    fileInputRef,
    handleFileSelect,
    handleFilterSave,
    handleRemoveFile,
    handleSubmit,
    reset,
    storyElements, setStoryElements,
    storyBgStyle, setStoryBgStyle,
    isComposed, setIsComposed,
    isPending
  } = useCreatePost();

  const isStoryMode = mode === 'STORY';
  const [showStoryComposer, setShowStoryComposer] = React.useState(false);

  // Track step direction for animations
  const prevStepRef = React.useRef(step);
  React.useEffect(() => {
    const prevIdx = STEP_ORDER.indexOf(prevStepRef.current);
    const currIdx = STEP_ORDER.indexOf(step);
    setStepDirection(currIdx >= prevIdx ? 1 : -1);
    prevStepRef.current = step;
  }, [step]);

  // Auto-open composer for new story images
  React.useEffect(() => {
    if (isStoryMode && step === 'edit' && mediaFiles.length > 0 && !isComposed && mediaFiles[0].type === 'image') {
      setShowStoryComposer(true);
    }
  }, [isStoryMode, step, mediaFiles, isComposed, setIsComposed]);

  // Reset composed state when restarting
  React.useEffect(() => {
    if (step === 'upload') setIsComposed(false);
  }, [step, setIsComposed]);

  const handleComposerSave = async (blob: Blob) => {
    const file = new File([blob], "story_composed.png", { type: "image/png" });
    const url = URL.createObjectURL(file);
    setMediaFiles([{ file, url, type: 'image' }]);
    setIsComposed(true);
    setShowStoryComposer(false);
    setStep('edit');
  };

  // --- Sub-screens & Overlays ---

  if (showStoryComposer) {
    return (
      <StoryComposer
        initialMedia={mediaFiles[0]?.file}
        onClose={() => {
          setShowStoryComposer(false);
          if (mediaFiles.length > 0) setIsComposed(true);
        }}
        onPost={handleComposerSave}
        elements={storyElements}
        bgStyle={storyBgStyle}
        onElementsChange={setStoryElements}
        onBgStyleChange={setStoryBgStyle}
      />
    );
  }

  if (currentEditIndex !== null) {
    if (isStoryMode) {
      setShowStoryComposer(true);
      setCurrentEditIndex(null);
      return null;
    }

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
        isPremium={isPremium}
        setIsPremium={setIsPremium}
        price={price}
        setPrice={setPrice}
        onClose={() => setSubScreen('none')}
      />
    );
  }

  // --- Computed Values ---
  const headerTitle = mode === 'STORY' ? 'Add to Story' : mode === 'FRAME' ? 'New Frame' : 'New Post';

  const nextLabel = (() => {
    if (step === 'caption' || (isStoryMode && step === 'edit')) {
      return isPending ? null : 'Share';
    }
    return 'Next';
  })();

  const handleNext = () => {
    if (step === 'edit') {
      if (isStoryMode) handleSubmit();
      else setStep('caption');
    } else if (step === 'caption') {
      handleSubmit();
    }
  };

  // --- Main Modal Content ---
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        layout
        className={`
          bg-neutral-900/95 backdrop-blur-2xl border border-white/6 w-full
          ${step === 'caption' ? 'max-w-4xl h-[78vh]' : 'max-w-md max-h-[88vh] h-full'}
          rounded-3xl overflow-hidden shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)]
          flex flex-col relative
        `}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-0 z-30 shrink-0">
          {/* Top bar: Back + Title + Action */}
          <div className="flex justify-between items-center mb-1">
            <button
              type="button"
              onClick={reset}
              className="p-2 -ml-1 hover:bg-white/5 rounded-xl text-white/70 hover:text-white transition-all"
              aria-label="Go back"
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>

            <h2
              className="font-bold text-[15px] tracking-tight text-white/90"
              id="modal-title"
            >
              {headerTitle}
            </h2>

            <button
              type="button"
              onClick={handleNext}
              disabled={isPending || mediaFiles.length === 0}
              className={`
                px-4 py-1.5 rounded-xl font-bold text-sm transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed
                ${nextLabel === 'Share'
                  ? 'bg-linear-to-r from-brand-primary to-brand-blue text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 active:scale-95'
                  : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                }
              `}
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                nextLabel
              )}
            </button>
          </div>

          {/* Progress Stepper */}
          <ProgressStepper currentStep={step} mode={mode} />
        </div>

        {/* Story-specific controls bar */}
        <AnimatePresence>
          {isStoryMode && step === 'edit' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden shrink-0 z-20"
            >
              <div className="flex items-center justify-center gap-3 py-2.5 bg-black/20 backdrop-blur-md border-b border-white/4">
                <button
                  type="button"
                  onClick={() => setShowMusicPicker(true)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedAudio
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white/6 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <MusicIcon size={12} className={selectedAudio ? 'fill-white' : ''} />
                  {selectedAudio ? selectedAudio.title : 'Add Music'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCloseFriendsOnly(!isCloseFriendsOnly)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isCloseFriendsOnly
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'bg-white/6 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Star size={12} className={isCloseFriendsOnly ? 'fill-white' : ''} />
                  {isCloseFriendsOnly ? 'Close Friends' : 'Your Story'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content — Animated Step Transitions */}
        <div
          className={`flex-1 flex flex-col min-h-[300px] relative ${
            step === 'edit' ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          <AnimatePresence custom={stepDirection} mode="wait">
            {step === 'upload' && (
              <motion.div
                key="upload"
                className="flex-1 flex flex-col h-full"
                custom={stepDirection}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <UploadStep
                  fileInputRef={fileInputRef}
                  handleFileSelect={handleFileSelect}
                  mode={mode}
                  setMode={setMode}
                  onTextStory={() => setShowStoryComposer(true)}
                />
              </motion.div>
            )}

            {step === 'edit' && (
              <motion.div
                key="edit"
                className="flex-1 flex flex-col h-full"
                custom={stepDirection}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <EditStep
                  mediaFiles={mediaFiles}
                  mode={mode}
                  setMode={setMode}
                  setCurrentEditIndex={setCurrentEditIndex}
                  handleRemoveFile={handleRemoveFile}
                  fileInputRef={fileInputRef}
                />
              </motion.div>
            )}

            {step === 'caption' && (
              <motion.div
                key="caption"
                className="flex-1 flex flex-col h-full"
                custom={stepDirection}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Music Picker Overlay */}
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
