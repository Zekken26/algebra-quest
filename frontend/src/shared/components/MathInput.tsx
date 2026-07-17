import "mathlive/static.css";
import { createElement, useEffect, useRef, useState } from "react";

type MathInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mathMode?: boolean;
};

export function MathInput({ value, onChange, placeholder, className, disabled, mathMode = true }: MathInputProps) {
  const ref = useRef<HTMLElement>(null);
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

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    if ((el as any).value !== value) {
      (el as any).value = value;
    }
    const handler = () => {
      onChange((el as any).value);
    };
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, [ready, value, onChange, mathMode]);

  if (!mathMode) {
    return (
      <textarea
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
    ref,
    className,
    disabled,
    placeholder: placeholder ?? "",
  });
}
