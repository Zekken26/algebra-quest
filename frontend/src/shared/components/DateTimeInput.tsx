import { forwardRef, type CSSProperties, type InputHTMLAttributes } from "react";

type DateTimeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  type?: "date" | "datetime-local" | "time";
};

const INLINE_STYLES: CSSProperties = {
  height: 48,
  minHeight: 48,
  padding: "0 16px",
  boxSizing: "border-box",
  fontSize: 16,
  lineHeight: 1.4,
};

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ type = "datetime-local", className, style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`teacher-input${className ? ` ${className}` : ""}`}
        style={{ ...INLINE_STYLES, ...style }}
        {...props}
      />
    );
  },
);

DateTimeInput.displayName = "DateTimeInput";
