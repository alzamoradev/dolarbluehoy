'use client';

import React from 'react';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  titleAs?: 'h1' | 'h2' | 'span'; // SEO: h1 para título principal, h2 para secciones
}

export const Win98Window: React.FC<WindowProps> = ({ title, children, icon, onClose, className = '', titleAs = 'h2' }) => {
  const TitleTag = titleAs;
  
  return (
    <div className={`bg-win-gray border-2 p-1 flex flex-col shadow-xl ${className}`}
         style={{
           borderTopColor: '#fff',
           borderLeftColor: '#fff',
           borderRightColor: '#000',
           borderBottomColor: '#000',
           boxShadow: '4px 4px 0px rgba(0,0,0,0.5)'
         }}>
      {/* Title Bar */}
      <div className="bg-win-blue px-2 py-1 flex justify-between items-center mb-1">
        <TitleTag className="flex items-center gap-2 text-white font-bold tracking-wider text-sm truncate font-retro m-0">
          {icon && <span className="w-4 h-4">{icon}</span>}
          {title}
        </TitleTag>
        <div className="flex gap-1">
          {onClose && (
            <button 
              onClick={onClose}
              className="w-5 h-5 bg-win-gray flex items-center justify-center border text-xs font-bold active:translate-y-[1px]"
              style={{
                borderColor: '#fff #000 #000 #fff'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export const Win98Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => {
  return (
    <button 
      className={`bg-win-gray px-4 py-1 text-black font-retro active:border-t-black active:border-l-black active:border-b-white active:border-r-white active:bg-[#b0b0b0] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#fff #000 #000 #fff'
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export const Win98Panel: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => {
  return (
    <div 
      className={`bg-white p-2 ${className}`}
      style={{
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#000 #fff #fff #000'
      }}
    >
      {children}
    </div>
  );
};
