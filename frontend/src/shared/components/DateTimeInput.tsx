import { forwardRef, type InputHTMLAttributes } from "react";

type DateTimeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  type?: "date" | "datetime-local" | "time";
};

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ type = "datetime-local", className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`teacher-input${className ? ` ${className}` : ""}`}
        {...props}
      />
    );
  },
);

DateTimeInput.displayName = "DateTimeInput";
