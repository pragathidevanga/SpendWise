import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightElement,
  id,
  className = '',
  required = false,
  ...props
}, ref) => {
  const inputId = id || (label ? `input_${label.toLowerCase().replace(/\s+/g, '_')}` : undefined);

  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon-left" size={18} />}
        <input
          ref={ref}
          id={inputId}
          className={`input-field ${Icon ? 'with-icon-left' : ''} ${rightElement ? 'with-right-element' : ''}`}
          {...props}
        />
        {rightElement && <div className="input-right-element">{rightElement}</div>}
      </div>
      {error ? (
        <p className="input-error-msg">{error}</p>
      ) : helperText ? (
        <p className="input-helper-msg">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
