import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  labelClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  helperText,
  error,
  required,
  containerClassName = "space-y-1",
  labelClassName = "font-label-sm text-xs font-semibold text-on-surface-variant",
  id,
  className = "",
  children, // allows overriding options via standard JSX if needed
  ...props
}) => {
  const selectElement = (
    <select
      id={id}
      required={required}
      className={`bg-white border border-outline-variant rounded-lg px-md py-2.5 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
        error ? "border-error focus:ring-error/20" : ""
      } ${className}`}
      {...props}
    >
      {children
        ? children
        : options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
    </select>
  );

  if (!label) {
    return selectElement;
  }

  return (
    <div className={containerClassName}>
      <label className={labelClassName} htmlFor={id}>
        {label} {required && <span className="text-error">*</span>}
      </label>
      {selectElement}
      {error ? (
        <p className="text-[10px] text-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-on-surface-variant/60">{helperText}</p>
      ) : null}
    </div>
  );
};
