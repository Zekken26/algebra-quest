import "mathlive/static.css";
import { createElement, useEffect, useState } from "react";

type MathInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mathMode?: boolean;
};

export function MathInput({ value, onChange, placeholder, className, disabled, mathMode = true }: MathInputProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    import("mathlive").then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!mathMode) {
    return (
      <textarea
        key="text"
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  if (!ready) {
    return (
      <input
        key="fallback"
        className={className}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  return createElement("math-field", {
    key: "math",
    className,
    disabled,
    placeholder: placeholder ?? "",
    value,
    onInput: (e: any) => onChange((e.target as any).value ?? ""),
  });
}
