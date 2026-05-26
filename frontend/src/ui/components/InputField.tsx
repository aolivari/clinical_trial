import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  labelClassName?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  helperText,
  error,
  required,
  containerClassName = "space-y-1",
  labelClassName = "font-label-sm text-xs font-semibold text-on-surface-variant",
  id,
  className = "",
  ...props
}) => {
  return (
    <div className={containerClassName}>
      <label className={labelClassName} htmlFor={id}>
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        id={id}
        required={required}
        className={`w-full bg-white border border-outline-variant rounded-lg px-md py-2.5 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
          error ? "border-error focus:ring-error/20" : ""
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-[10px] text-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-on-surface-variant/60">{helperText}</p>
      ) : null}
    </div>
  );
};
