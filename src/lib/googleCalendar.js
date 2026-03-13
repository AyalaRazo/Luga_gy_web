/**
 * Google Calendar — integración para citas de Luga Gy
 *
 * Flujo:
 *  1. El cliente llena el formulario en BookingSection
 *  2. La cita se guarda en Supabase (tabla `citas`)
 *  3. Esta función crea el evento en Google Calendar
 *
 * REQUISITO: El usuario debe reconectar Google Calendar con el scope
 * 'https://www.googleapis.com/auth/calendar.events'
 */

// Duración estimada por servicio (en minutos)
const DURACIONES = {
  'Pedicure Spa':             60,
  'Manicure Gel':             45,
  'Uñas Acrílicas':          90,
  'Extensiones de Pestañas': 120,
  'Lifting de Pestañas':      60,
  'Diseño de Cejas':          30,
  'Laminado de Cejas':        45,
  'Spa de Pies Completo':     75,
};

const DIRECCION = 'Calle Gordiano Guzmán #1400, Independencia, 21290 Mexicali, B.C., México';
const CALENDAR_ID = import.meta.env.VITE_GCAL_CALENDAR_ID || 'primary';

/**
 * Crea un evento en Google Calendar para la cita reservada.
 * Usa la Calendar REST API con un token OAuth del usuario autenticado.
 *
 * @param {{ nombre: string, servicio: string, fecha: string, hora: string, googleEventId?: string }} cita
 * @param {string} accessToken — OAuth token del propietario del calendario
 * @returns {{ eventId: string, htmlLink: string } | null}
 */
export async function crearEventoCalendario(cita, accessToken) {
  if (!accessToken) {
    console.warn('[GCal] No hay accessToken. El evento no se creará en Calendar.');
    return null;
  }

  const duracion = DURACIONES[cita.servicio] ?? 60;

  // Construir fechas en ISO 8601 con zona horaria de Mexicali (America/Tijuana)
  const startISO = `${cita.fecha}T${cita.hora}:00`;
  const endDate  = calcularFin(cita.fecha, cita.hora, duracion);

  const evento = {
    summary:     `💅 ${cita.servicio} — ${cita.nombre}`,
    location:    DIRECCION,
    description: `Cita reservada desde la web de Luga Gy.\n\nCliente: ${cita.nombre}\nServicio: ${cita.servicio}\nDuración estimada: ${duracion} min`,
    start: {
      dateTime: startISO,
      timeZone: 'America/Tijuana',
    },
    end: {
      dateTime: endDate,
      timeZone: 'America/Tijuana',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
    colorId: '4', // Flamingo — rosa
  };

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
      {
        method:  'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evento),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('[GCal] Error al crear evento:', err);
      return null;
    }

    const created = await res.json();
    return { eventId: created.id, htmlLink: created.htmlLink };
  } catch (err) {
    console.error('[GCal] Error de red:', err);
    return null;
  }
}

// ─── Utilidad ──────────────────────────────────────────────────────────────────
function calcularFin(fecha, hora, duracionMinutos) {
  const [h, m] = hora.split(':').map(Number);
  const total  = h * 60 + m + duracionMinutos;
  const hFin   = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mFin   = String(total % 60).padStart(2, '0');
  return `${fecha}T${hFin}:${mFin}:00`;
}
