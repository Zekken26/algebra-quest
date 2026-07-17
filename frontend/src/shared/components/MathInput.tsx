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
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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
    if (!el) return;
    const handler = () => {
      onChangeRef.current((el as any).value ?? "");
    };
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, [ready]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if ((el as any).value !== value) {
      (el as any).value = value;
    }
  });

  useEffect(() => {
    if (mathMode && ready && ref.current) {
      ref.current.focus();
    }
  }, [mathMode, ready]);

  if (mathMode && !ready) {
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

  return (
    <>
      <textarea
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{ display: mathMode ? "none" : undefined }}
      />
      {ready && createElement("math-field", {
        ref,
        className,
        disabled,
        placeholder: placeholder ?? "",
        style: { display: mathMode ? undefined : "none" },
      })}
    </>
  );
}
