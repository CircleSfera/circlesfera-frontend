import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { passkeyApi } from '../../services';
import { Key, Shield, Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { logger } from '../../utils/logger';

export const PasskeySettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Get options from server
      const optionsResponse = await passkeyApi.getRegistrationOptions();
      const options = optionsResponse.data;

      // 2. Start registration in browser
      const attestationResponse = await startRegistration(options);

      // 3. Verify on server
      const verificationResponse = await passkeyApi.verifyRegistration(
        attestationResponse as unknown as Record<string, unknown>,
      );

      if (verificationResponse.data.verified) {
        setSuccess(true);
      } else {
        setError('Verification failed');
      }
    } catch (err: unknown) {
      logger.error('Passkey registration error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:border-blue-500/30 group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic">Security Keys (Passkeys)</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Passwordless, ultra-secure login</p>
          </div>
        </div>
        <Shield className="w-6 h-6 text-zinc-400 dark:text-zinc-600 opacity-50 group-hover:rotate-12 transition-transform" />
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
            Passkeys allow you to log in securely using your device's biometric sensors (like Touch ID or Face ID) or hardware security keys.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">Passkey registered successfully!</p>
          </div>
        )}

        <button type="button"
          onClick={handleRegister}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Initializing Secure Handshake...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Add New Security Key</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-8 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-6">
        <Shield className="w-4 h-4" />
        <span>FIDO2 / WebAuthn Certified Protection</span>
      </div>
    </div>
  );
};

export default PasskeySettings;
