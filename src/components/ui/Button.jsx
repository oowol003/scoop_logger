import React from 'react';
import { useViewOptions } from '../../context/ViewOptionsContext';
import { colors } from '../../utils/colors';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const { viewOptions } = useViewOptions();
  const colorScheme = viewOptions.darkMode ? colors.darkMode : colors.lightMode;

  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200';
  
  const variants = {
    primary: `bg-[${colorScheme.button.primary}] hover:bg-[${colorScheme.button.primaryHover}] text-white`,
    secondary: `bg-[${colorScheme.button.secondary}] hover:bg-[${colorScheme.button.secondaryHover}] text-gray-700`,
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};