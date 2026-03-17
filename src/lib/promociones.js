/**
 * Filtra las promociones activas para el día y fecha actual.
 * Usa Date.getDay(): 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
 */
export function promosParaHoy(promos, date = new Date()) {
  const dow   = date.getDay();
  const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return promos.filter(p =>
    p.dias_semana.includes(dow) &&
    (!p.fecha_inicio || today >= p.fecha_inicio) &&
    (!p.fecha_fin    || today <= p.fecha_fin)
  );
}

/**
 * Calcula el precio efectivo de un servicio considerando las promos de hoy.
 * Si hay varias promos aplicables, gana la que genera el mayor ahorro.
 *
 * @param {number}  precio      Precio base del servicio
 * @param {Array}   promosHoy   Resultado de promosParaHoy()
 * @param {string}  servicioId  UUID del servicio
 * @returns {{ precioFinal: number, promo: object|null }}
 */
export function calcularPrecioEfectivo(precio, promosHoy, servicioId) {
  const aplicables = promosHoy.filter(p =>
    p.servicio_ids === null || p.servicio_ids.includes(servicioId)
  );

  if (!aplicables.length) return { precioFinal: precio, promo: null };

  let mejor = null;
  let mejorPrecio = precio;

  for (const p of aplicables) {
    const candidato =
      p.tipo_descuento === 'porcentaje'
        ? precio * (1 - p.valor_descuento / 100)
        : Number(p.valor_descuento); // precio_fijo = precio final directo

    if (candidato < mejorPrecio) {
      mejorPrecio = candidato;
      mejor = p;
    }
  }

  return { precioFinal: Math.round(mejorPrecio), promo: mejor };
}

export const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
