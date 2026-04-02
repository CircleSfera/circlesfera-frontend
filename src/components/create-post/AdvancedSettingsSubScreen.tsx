interface AdvancedSettingsSubScreenProps {
  hideLikes: boolean;
  setHideLikes: (value: boolean) => void;
  turnOffComments: boolean;
  setTurnOffComments: (value: boolean) => void;
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
  price: number | '';
  setPrice: (value: number | '') => void;
  onClose: () => void;
}

export default function AdvancedSettingsSubScreen({
  hideLikes,
  setHideLikes,
  turnOffComments,
  setTurnOffComments,
  isPremium,
  setIsPremium,
  price,
  setPrice,
  onClose
}: AdvancedSettingsSubScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <button type="button" onClick={onClose} className="text-white hover:text-gray-300" aria-label="Go back">
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
            <button 
              type="button"
              role="switch"
              aria-checked={hideLikes}
              onClick={() => setHideLikes(!hideLikes)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${hideLikes ? 'bg-blue-500' : 'bg-neutral-700'}`}
              aria-label="Toggle hide like counts"
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${hideLikes ? 'left-7' : 'left-1'}`}/>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Turn off commenting</div>
              <div className="text-xs text-gray-400 mt-1 max-w-[280px]">You can change this later by going to the ... menu at the top of your post.</div>
            </div>
            <button 
              type="button"
              role="switch"
              aria-checked={turnOffComments}
              onClick={() => setTurnOffComments(!turnOffComments)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${turnOffComments ? 'bg-blue-500' : 'bg-neutral-700'}`}
              aria-label="Toggle commenting"
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${turnOffComments ? 'left-7' : 'left-1'}`}/>
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-400 flex items-center gap-2">
                  Contenido Premium (PPV)
                </div>
                <div className="text-xs text-gray-400 mt-1 max-w-[280px]">
                  Bloquea este contenido. Los usuarios deberán pagar el precio establecido para verlo.
                </div>
              </div>
              <button 
                type="button"
                role="switch"
                aria-checked={isPremium}
                onClick={() => setIsPremium(!isPremium)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isPremium ? 'bg-blue-500' : 'bg-neutral-700'}`}
                aria-label="Toggle premium content"
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isPremium ? 'left-7' : 'left-1'}`}/>
              </button>
            </div>

            {isPremium && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  Precio de Desbloqueo (USD)
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-blue-400 transition-colors">
                    $
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.50"
                    placeholder="5.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-bold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 px-1 italic">
                  Recibirás el 80% del importe neto después de comisiones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
