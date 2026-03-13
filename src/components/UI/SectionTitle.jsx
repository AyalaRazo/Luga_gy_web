import React from 'react';

const SectionTitle = ({ title, subtitle, align = 'center', light = false }) => {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div className={`mb-12 flex flex-col ${alignClasses[align]}`}>
      <h2
        className={`font-great-vibes text-5xl md:text-6xl leading-tight mb-2 ${
          light ? 'text-white' : 'text-pink-400'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`font-poppins text-base md:text-lg max-w-2xl mt-2 leading-relaxed ${
            light ? 'text-white/80' : 'text-gray-500'
          }`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`w-20 h-0.5 mt-4 rounded-full ${
          light
            ? 'bg-gradient-to-r from-white/60 to-white/20'
            : 'bg-gradient-to-r from-pink-300 via-pink-400 to-gold-400'
        }`}
      />
    </div>
  );
};

export default SectionTitle;
