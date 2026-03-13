import React, { useEffect, useState } from 'react';
import { Save, Link, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Eye, EyeOff, Bell } from 'lucide-react';
import { getSettings, updateSettings, gcalSync } from '../../lib/supabase';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export default function AdminSettings() {
  const [settings, setSettings] = useState({ google_client_id: '', google_client_secret: '', google_calendar_id: '', admin_email: '' });
  const [savingEmail, setSavingEmail] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState({ msg: '', type: 'ok' });
  const [showSecret, setShowSecret] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'ok' }), 4000);
  };

  useEffect(() => {
    getSettings().then(({ data }) => {
      if (data) setSettings({
        google_client_id:     data.google_client_id     ?? '',
        google_client_secret: data.google_client_secret ?? '',
        google_calendar_id:   data.google_calendar_id   ?? 'primary',
        admin_email:          data.admin_email           ?? '',
      });
      setLoading(false);
    });
  }, []);

  // Handle OAuth callback: ?code=...&scope=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    if (!code) return;

    // Remove code from URL
    window.history.replaceState({}, '', window.location.pathname);

    const storedClientId     = sessionStorage.getItem('gcal_client_id');
    const storedClientSecret = sessionStorage.getItem('gcal_client_secret');
    if (!storedClientId || !storedClientSecret) return;

    setConnecting(true);
    gcalSync({
      action:               'exchange_code',
      code,
      redirectUri:          `${window.location.origin}/admin/settings`,
      google_client_id:     storedClientId,
      google_client_secret: storedClientSecret,
    }).then(({ data, error }) => {
      setConnecting(false);
      sessionStorage.removeItem('gcal_client_id');
      sessionStorage.removeItem('gcal_client_secret');
      if (error || data?.error) {
        showToast(data?.error ?? 'Error al conectar Google Calendar.', 'error');
      } else {
        showToast('¡Google Calendar conectado correctamente!', 'ok');
        // Refresh settings display
        getSettings().then(({ data: s }) => {
          if (s) setSettings(prev => ({ ...prev, google_calendar_id: s.google_calendar_id ?? 'primary' }));
        });
      }
    });
  }, []);

  async function handleSaveCredentials(e) {
    e.preventDefault();
    if (!settings.google_client_id || !settings.google_client_secret) {
      showToast('Ingresá el Client ID y Client Secret.', 'error');
      return;
    }
    setSaving(true);
    const { data, error } = await gcalSync({
      action:               'save_settings',
      google_client_id:     settings.google_client_id,
      google_client_secret: settings.google_client_secret,
      google_calendar_id:   settings.google_calendar_id || 'primary',
    });
    setSaving(false);
    if (error || data?.error) {
      showToast(data?.error ?? 'Error al guardar.', 'error');
    } else {
      showToast('Credenciales guardadas.');
    }
  }

  async function handleSaveAdminEmail(e) {
    e.preventDefault();
    setSavingEmail(true);
    const { error } = await updateSettings({ admin_email: settings.admin_email || null });
    setSavingEmail(false);
    if (error) showToast('Error al guardar el email.', 'error');
    else showToast('Email de notificaciones guardado.');
  }

  function handleConnectGoogle() {
    if (!settings.google_client_id || !settings.google_client_secret) {
      showToast('Primero guardá el Client ID y Client Secret.', 'error');
      return;
    }
    // Store in session before redirecting
    sessionStorage.setItem('gcal_client_id',     settings.google_client_id);
    sessionStorage.setItem('gcal_client_secret', settings.google_client_secret);

    const redirectUri = `${window.location.origin}/admin/settings`;
    const params = new URLSearchParams({
      client_id:     settings.google_client_id,
      redirect_uri:  redirectUri,
      response_type: 'code',
      scope:         SCOPES,
      access_type:   'offline',
      prompt:        'consent',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 font-poppins text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all";
  const labelClass = "block font-poppins text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide";

  return (
    <div className="overflow-y-auto flex-1"><div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-poppins text-sm ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-poppins text-2xl font-bold text-gray-800 dark:text-gray-100">Ajustes</h1>
        <p className="font-poppins text-sm text-gray-400 dark:text-gray-500 mt-0.5">Notificaciones y Google Calendar</p>
      </div>

      {/* Notificaciones */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
            <Bell size={16} className="text-pink-500" />
          </div>
          <div>
            <h2 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100">Email de notificaciones</h2>
            <p className="font-poppins text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Cuando un cliente reserve una cita, recibirás un aviso en este correo (vía MailerLite).
            </p>
          </div>
        </div>
        <form onSubmit={handleSaveAdminEmail} className="flex gap-3 flex-wrap">
          <input
            type="email"
            value={settings.admin_email}
            onChange={e => setSettings(p => ({ ...p, admin_email: e.target.value }))}
            placeholder="tucorreo@gmail.com"
            className={`${inputClass} flex-1 min-w-48`}
          />
          <button
            type="submit"
            disabled={savingEmail}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm"
          >
            {savingEmail ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Guardar
          </button>
        </form>
      </div>

      {/* Step 1 — Create OAuth Client */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 font-poppins text-xs font-bold flex items-center justify-center shrink-0">1</div>
          <div>
            <h2 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100">Crear credenciales en Google Cloud</h2>
            <p className="font-poppins text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Necesitás un OAuth 2.0 Client ID de tipo <strong>Web application</strong>. En "Authorized redirect URIs" agregá exactamente:
              <br />
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-pink-600 dark:text-pink-400 text-xs mt-1 inline-block">
                {window.location.origin}/admin/settings
              </code>
            </p>
          </div>
        </div>
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 border border-gray-200 dark:border-gray-600 hover:border-pink-200 font-poppins text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 transition-all cursor-pointer"
        >
          <ExternalLink size={14} />
          Abrir Google Cloud Console
        </a>
      </div>

      {/* Step 2 — Enter credentials */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 font-poppins text-xs font-bold flex items-center justify-center shrink-0">2</div>
          <h2 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">Ingresar credenciales</h2>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div>
            <label className={labelClass}>Google Client ID</label>
            <input
              type="text"
              value={settings.google_client_id}
              onChange={e => setSettings(p => ({ ...p, google_client_id: e.target.value }))}
              placeholder="xxxxxx.apps.googleusercontent.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Google Client Secret</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={settings.google_client_secret}
                onChange={e => setSettings(p => ({ ...p, google_client_secret: e.target.value }))}
                placeholder="GOCSPX-…"
                className={`${inputClass} pr-10`}
              />
              <button type="button" onClick={() => setShowSecret(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 cursor-pointer">
                {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Calendar ID (dejá "primary" para usar el calendario principal)</label>
            <input
              type="text"
              value={settings.google_calendar_id}
              onChange={e => setSettings(p => ({ ...p, google_calendar_id: e.target.value }))}
              placeholder="primary o correo@gmail.com"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            Guardar credenciales
          </button>
        </form>
      </div>

      {/* Step 3 — Connect */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 font-poppins text-xs font-bold flex items-center justify-center shrink-0">3</div>
          <div>
            <h2 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">Conectar con Google Calendar</h2>
            <p className="font-poppins text-xs text-gray-500 dark:text-gray-400 mt-1">
              Autorizá el acceso a tu Google Calendar. Solo necesitás hacerlo una vez.
            </p>
          </div>
        </div>

        <button
          onClick={handleConnectGoogle}
          disabled={connecting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-blue-200 hover:border-blue-400 font-poppins text-sm font-semibold text-blue-600 dark:text-blue-400 transition-all cursor-pointer"
        >
          {connecting
            ? <><RefreshCw size={15} className="animate-spin" /> Conectando…</>
            : <><Link size={15} /> Conectar Google Calendar</>
          }
        </button>
      </div>
    </div></div>
  );
}
