import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages));
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
    result.push(sorted[i]);
  }
  return result;
}

export default function Pagination({ page, totalPages, total, pageSize, onChange }) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex-wrap gap-3">
      {/* Contador */}
      <p className="font-poppins text-xs text-gray-400">
        Mostrando{' '}
        <span className="font-semibold text-gray-600">{from}–{to}</span>
        {' '}de{' '}
        <span className="font-semibold text-gray-600">{total}</span>
        {' '}registros
      </p>

      {/* Controles — solo si hay más de una página */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Página anterior"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center font-poppins text-xs text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-poppins text-xs font-medium transition-all duration-150 cursor-pointer border ${
                  page === p
                    ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Página siguiente"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
