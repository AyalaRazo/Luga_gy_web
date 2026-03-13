import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import SectionTitle from '../UI/SectionTitle';
import ElegantButton from '../UI/ElegantButton';
import { WhatsAppIcon } from '../UI/SocialIcons';
import { SOCIAL_LINKS, BUSINESS_INFO } from '../UI/SocialIcons';
import { crearCita, getCitasPorFecha, sendBookingEmail, getHorario, getDiasBloqueados } from '../../lib/supabase';

const serviceOptions = [
  'Pedicure Spa',
  'Manicure Gel',
  'Uñas Acrílicas',
  'Extensiones de Pestañas',
  'Lifting de Pestañas',
  'Diseño de Cejas',
  'Laminado de Cejas',
  'Spa de Pies Completo',
];

const DIA_KEYS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

function generarSlots(inicio, fin) {
  const slots = [];
  const [hI, mI] = inicio.split(':').map(Number);
  const [hF, mF] = fin.split(':').map(Number);
  let cur = hI * 60 + mI;
  const end = hF * 60 + mF;
  while (cur < end) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`);
    cur += 60;
  }
  return slots;
}

// Estados del formulario
const ESTADO = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

const BookingSection = () => {
  const [service, setService]         = useState('');
  const [date, setDate]               = useState('');
  const [time, setTime]               = useState('');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [telefono, setTelefono]       = useState('');
  const [status, setStatus]           = useState(ESTADO.IDLE);
  const [errorMsg, setErrorMsg]       = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [horario,       setHorario]   = useState(null);
  const [diasBloqueados, setDiasBloqueados] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [dateBlocked,   setDateBlocked]     = useState(false);

  const todayISO = new Date().toISOString().split('T')[0];

  // Cargar horario y días bloqueados al montar
  useEffect(() => {
    Promise.all([getHorario(), getDiasBloqueados()]).then(([{ data: h }, { data: dias }]) => {
      if (h) setHorario(h);
      setDiasBloqueados((dias ?? []).map(d => d.fecha));
    });
  }, []);

  // Cuando cambia la fecha: calcular slots disponibles según horario + días bloqueados
  useEffect(() => {
    if (!date) { setBookedSlots([]); setAvailableSlots([]); setDateBlocked(false); return; }

    // Verificar si el día está bloqueado
    if (diasBloqueados.includes(date)) {
      setDateBlocked(true);
      setAvailableSlots([]);
      setBookedSlots([]);
      return;
    }
    setDateBlocked(false);

    // Calcular slots según horario semanal
    const dayIndex = new Date(date + 'T12:00:00').getDay();
    const dayKey   = DIA_KEYS[dayIndex];
    const diaConfig = horario?.[dayKey];
    if (!diaConfig?.activo) {
      setAvailableSlots([]);
      setBookedSlots([]);
      return;
    }
    const slots = generarSlots(diaConfig.inicio, diaConfig.fin);
    setAvailableSlots(slots);

    // Cargar citas ya reservadas
    setLoadingSlots(true);
    getCitasPorFecha(date)
      .then(({ data }) => {
        setBookedSlots((data || []).map(c => c.hora.slice(0, 5)));
      })
      .finally(() => setLoadingSlots(false));
  }, [date, horario, diasBloqueados]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service || !date || !time || !email || !telefono) return;

    setStatus(ESTADO.LOADING);
    setErrorMsg('');

    // 1. Guardar en Supabase
    const { data: citaGuardada, error } = await crearCita({ nombre: name, servicio: service, fecha: date, hora: time, email, telefono });

    if (error) {
      console.error('[Booking] Error Supabase:', error);
      setStatus(ESTADO.ERROR);
      setErrorMsg('No pudimos guardar tu cita. Por favor escribinos por WhatsApp.');
      return;
    }

    // 2. Enviar email de confirmación con token
    const token = citaGuardada?.confirmation_token;
    const { error: emailError } = await sendBookingEmail({ email, name, servicio: service, fecha: date, hora: time, token, telefono });
    if (emailError) console.warn('[Booking] Email no enviado:', emailError);

    setStatus(ESTADO.SUCCESS);

    // 2. Abrir WhatsApp con la info pre-cargada (confirmación inmediata)
    const msg = `¡Hola Luga Gy! 😊 Soy ${name || 'una clienta'} y reservé una cita:\n\n📋 *Servicio:* ${service}\n📅 *Fecha:* ${date}\n⏰ *Hora:* ${time}\n\n¿Me confirman la disponibilidad?`;
    setTimeout(() => {
      window.open(`${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 800);
  };

  const resetForm = () => {
    setService(''); setDate(''); setTime(''); setName(''); setEmail('');
    setStatus(ESTADO.IDLE); setErrorMsg(''); setBookedSlots([]); setTelefono('');
  };

  const slotDisabled = (slot) => bookedSlots.includes(slot);
  const isDayClosed  = date && !dateBlocked && horario && availableSlots.length === 0;

  // Genera lista de horarios para el panel lateral
  const scheduleInfo = [
    { key: 'lunes',     day: 'Lun – Vie' },
    { key: 'sabado',    day: 'Sábado'    },
    { key: 'domingo',   day: 'Domingo'   },
  ].map(({ key, day }) => {
    const d = horario?.[key];
    if (!d) return { day, hours: '–', open: false };
    return {
      day,
      hours: d.activo ? `${d.inicio} – ${d.fin}` : 'Cerrado',
      open: d.activo,
    };
  });

  return (
    <section id="reservar" className="section-padding bg-pink-50/60">
      <div className="container-custom">
        <SectionTitle
          title="Reserva tu Cita"
          subtitle="Elige el servicio, día y hora que prefieras. Te confirmamos vía Correo Electrónico o Whatsapp."
        />

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-pink-md overflow-hidden border border-pink-100">
            <div className="grid md:grid-cols-5">

              {/* ── Formulario ─────────────────────────── */}
              <div className="md:col-span-3 p-7 lg:p-9">
                <h3 className="font-great-vibes text-3xl text-pink-400 mb-6">Agenda aquí</h3>

                {/* Estado: Éxito */}
                {status === ESTADO.SUCCESS && (
                  <div className="flex flex-col items-center justify-center py-10 gap-4 text-center animate-fade-in-up">
                    <CheckCircle size={52} className="text-green-400" aria-hidden="true" />
                    <div>
                      <p className="font-poppins text-gray-800 font-semibold text-lg">
                        ¡Cita guardada!
                      </p>
                      <p className="font-poppins text-sm text-gray-500 mt-1">
                        Te enviamos un email de confirmación a <strong className="text-pink-400">{email}</strong>.
                      </p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-4 w-full text-left text-sm font-poppins text-gray-600 space-y-1 border border-pink-100">
                      <p><span className="font-medium text-pink-400">Servicio:</span> {service}</p>
                      <p><span className="font-medium text-pink-400">Fecha:</span> {date}</p>
                      <p><span className="font-medium text-pink-400">Hora:</span> {time}</p>
                    </div>
                    <ElegantButton variant="outline" onClick={resetForm}>
                      Reservar otra cita
                    </ElegantButton>
                  </div>
                )}

                {/* Estado: Error */}
                {status === ESTADO.ERROR && (
                  <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-poppins text-sm text-red-600 font-medium">{errorMsg}</p>
                      <button
                        onClick={() => setStatus(ESTADO.IDLE)}
                        className="font-poppins text-xs text-red-400 underline mt-1 cursor-pointer"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulario */}
                {status !== ESTADO.SUCCESS && (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                    {/* Nombre */}
                    <div>
                      <label htmlFor="booking-name" className="block font-poppins text-sm font-medium text-gray-600 mb-1.5">
                        Tu nombre
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: María González"
                        className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none font-poppins text-sm text-gray-700 placeholder-gray-300 transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="booking-email" className="block font-poppins text-sm font-medium text-gray-600 mb-1.5">
                        Tu correo electrónico <span className="text-pink-400">*</span>
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ej: maria@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none font-poppins text-sm text-gray-700 placeholder-gray-300 transition-colors"
                      />
                      <p className="font-poppins text-xs text-gray-400 mt-1">Te enviaremos la confirmación de tu cita por email.</p>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label htmlFor="booking-phone" className="block font-poppins text-sm font-medium text-gray-600 mb-1.5">
                        Tu número de celular <span className="text-pink-400">*</span>
                      </label>
                      <input
                        id="booking-phone"
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej: 686 116 2619"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none font-poppins text-sm text-gray-700 placeholder-gray-300 transition-colors"
                      />
                    </div>

                    {/* Servicio */}
                    <div>
                      <label htmlFor="booking-service" className="block font-poppins text-sm font-medium text-gray-600 mb-1.5">
                        Servicio <span className="text-pink-400">*</span>
                      </label>
                      <select
                        id="booking-service"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none font-poppins text-sm text-gray-700 bg-white transition-colors cursor-pointer"
                      >
                        <option value="">Elige un servicio...</option>
                        {serviceOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Fecha */}
                    <div>
                      <label htmlFor="booking-date" className="block font-poppins text-sm font-medium text-gray-600 mb-1.5">
                        <Calendar size={14} className="inline mr-1 text-pink-400" aria-hidden="true" />
                        Fecha <span className="text-pink-400">*</span>
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); setTime(''); }}
                        required
                        min={todayISO}
                        className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none font-poppins text-sm text-gray-700 transition-colors cursor-pointer"
                      />
                    </div>

                    {/* Horarios */}
                    <div>
                      <p className="font-poppins text-sm font-medium text-gray-600 mb-2">
                        <Clock size={14} className="inline mr-1 text-pink-400" aria-hidden="true" />
                        Horario <span className="text-pink-400">*</span>
                        {loadingSlots && (
                          <Loader size={12} className="inline ml-2 text-pink-300 animate-spin" aria-hidden="true" />
                        )}
                      </p>

                      {/* Día bloqueado */}
                      {dateBlocked && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                          <AlertCircle size={15} className="text-amber-500 shrink-0" />
                          <p className="font-poppins text-sm text-amber-700">No hay atención este día.</p>
                        </div>
                      )}

                      {/* Día sin horario (cerrado) */}
                      {isDayClosed && (
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                          <AlertCircle size={15} className="text-gray-400 shrink-0" />
                          <p className="font-poppins text-sm text-gray-500">No trabajamos ese día. Elige otra fecha.</p>
                        </div>
                      )}

                      {/* Slots disponibles */}
                      {!dateBlocked && availableSlots.length > 0 && (
                        <div className="grid grid-cols-5 gap-2" role="group" aria-label="Seleccionar horario">
                          {availableSlots.map((slot) => {
                            const ocupado = slotDisabled(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={ocupado}
                                onClick={() => setTime(slot)}
                                className={`py-2 rounded-lg text-xs font-poppins font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                                  ocupado
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                    : time === slot
                                      ? 'bg-pink-400 text-white shadow-pink-sm cursor-pointer'
                                      : 'bg-pink-50 text-gray-600 hover:bg-pink-100 hover:text-pink-500 cursor-pointer'
                                }`}
                                aria-pressed={time === slot}
                                title={ocupado ? 'Horario no disponible' : slot}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {!date && (
                        <p className="font-poppins text-xs text-gray-400 mt-2">
                          Selecciona una fecha para ver disponibilidad.
                        </p>
                      )}
                      {date && !dateBlocked && availableSlots.length > 0 && bookedSlots.length > 0 && (
                        <p className="font-poppins text-xs text-gray-400 mt-2">
                          Los horarios tachados ya están reservados.
                        </p>
                      )}
                    </div>

                    <ElegantButton
                      type="submit"
                      className="w-full justify-center mt-2"
                      size="large"
                      disabled={!service || !date || !time || !email || !telefono || isDayClosed || dateBlocked || status === ESTADO.LOADING}
                    >
                      {status === ESTADO.LOADING ? (
                        <>
                          <Loader size={18} className="animate-spin" aria-hidden="true" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <WhatsAppIcon size={18} />
                          RESERVAR CITA
                        </>
                      )}
                    </ElegantButton>
                  </form>
                )}
              </div>

              {/* ── Panel lateral info ──────────────────── */}
              <div className="md:col-span-2 bg-gradient-to-br from-pink-400 to-pink-500 p-7 lg:p-9 text-white flex flex-col justify-between">
                <div>
                  <h3 className="font-great-vibes text-3xl mb-4">¿Preferís escribirnos?</h3>
                  <p className="font-poppins text-sm text-white/85 leading-relaxed mb-6">
                    Contactanos directamente por WhatsApp para consultar disponibilidad o hacer reservas personalizadas.
                  </p>

                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-4 mb-4 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <WhatsAppIcon size={28} />
                    <div>
                      <div className="font-poppins font-semibold text-sm">WhatsApp Directo</div>
                      <div className="font-poppins text-xs text-white/80">{SOCIAL_LINKS.whatsappNumber}</div>
                    </div>
                  </a>

                  {/* Horarios */}
                  <div className="border-t border-white/20 pt-4 mb-4">
                    <h4 className="font-poppins font-semibold text-sm mb-3">Horario de atención</h4>
                    <ul className="space-y-2">
                      {scheduleInfo.map(({ day, hours, open }) => (
                        <li key={day} className="flex justify-between items-center">
                          <span className="font-poppins text-xs text-white/80">{day}</span>
                          <span className={`font-poppins text-xs font-medium ${open ? 'text-white' : 'text-white/50'}`}>
                            {hours}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dirección */}
                  <div className="border-t border-white/20 pt-4">
                    <h4 className="font-poppins font-semibold text-sm mb-2">Dónde estamos</h4>
                    <p className="font-poppins text-xs text-white/80 leading-relaxed">
                      {BUSINESS_INFO.address}
                    </p>
                    <a
                      href={BUSINESS_INFO.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 font-poppins text-xs text-white/70 underline hover:text-white transition-colors cursor-pointer"
                    >
                      Ver en Google Maps
                    </a>
                  </div>
                </div>

                <div className="mt-6 text-center opacity-30" aria-hidden="true">
                  <span className="font-great-vibes text-4xl text-white">Beauty</span>
                </div>
              </div>

            </div>
          </div>

          <p className="text-center font-poppins text-xs text-gray-400 mt-5">
            Las citas quedan guardadas en nuestro sistema. Te confirmamos vía Correo Electrónico o Whatsapp.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
