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
  const wasUserInputRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;
    import("mathlive").then(() => {
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const showMathField = mathMode && ready;

  useEffect(() => {
    if (!showMathField) return;
    const el = ref.current;
    if (!el) return;

    (el as any).value = value;

    const onInput = () => {
      wasUserInputRef.current = true;
      onChangeRef.current((el as any).value ?? "");
    };
    el.addEventListener("input", onInput);

    el.focus();

    return () => {
      el.removeEventListener("input", onInput);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMathField]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !showMathField) return;
    if (wasUserInputRef.current) {
      wasUserInputRef.current = false;
      return;
    }
    if ((el as any).value !== value) {
      (el as any).value = value;
    }
  }, [value, showMathField]);

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
