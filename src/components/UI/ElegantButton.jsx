import React from 'react';

const ElegantButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'default',
  type = 'button',
  disabled = false,
  as: Tag = 'button',
  href,
  target,
  rel,
}) => {
  const variants = {
    primary:
      'bg-pink-400 hover:bg-pink-500 active:bg-pink-600 text-white shadow-pink-sm hover:shadow-pink-md',
    secondary:
      'bg-white hover:bg-pink-50 active:bg-pink-100 text-pink-500 border-2 border-pink-400',
    outline:
      'bg-transparent hover:bg-pink-50 active:bg-pink-100 text-pink-400 border border-pink-300',
    ghost:
      'bg-transparent hover:bg-pink-50 text-pink-400',
    dark:
      'bg-gray-900 hover:bg-gray-800 text-white',
  };

  const sizes = {
    small: 'px-4 py-1.5 text-xs',
    default: 'px-6 py-2.5 text-sm',
    large: 'px-8 py-3.5 text-base',
  };

  const sharedClasses = `
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.default}
    inline-flex items-center justify-center gap-2
    rounded-full
    font-poppins font-medium tracking-wide
    transition-all duration-250 ease-out
    focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    cursor-pointer
    ${className}
  `;

  if (Tag === 'a' || href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={sharedClasses}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={sharedClasses}
    >
      {children}
    </button>
  );
};

export default ElegantButton;
