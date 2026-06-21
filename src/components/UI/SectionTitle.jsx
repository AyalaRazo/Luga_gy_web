import React from 'react';

const SectionTitle = ({ title, subtitle, align = 'center', light = false }) => {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div className={`mb-8 flex flex-col ${alignClasses[align]}`}>
      <h2
        className={`font-playfair text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-2 ${
          light ? 'text-white' : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`font-poppins text-sm md:text-base max-w-2xl mt-1.5 leading-relaxed ${
            light ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`w-12 h-0.5 mt-4 ${
          light ? 'bg-white/50' : 'bg-pink-400'
        }`}
      />
    </div>
  );
};

export default SectionTitle;
