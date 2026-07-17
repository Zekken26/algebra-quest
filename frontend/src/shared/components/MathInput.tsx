import "mathlive/static.css";
import { createElement, useEffect, useRef, useState, memo } from "react";

type MathInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mathMode?: boolean;
};

export const MathInput = memo(function MathInput({ value, onChange, placeholder, className, disabled, mathMode = true }: MathInputProps) {
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
    console.log("[MathInput] SETUP effect running — adding listener");

    (el as any).value = value;

    const onInput = () => {
      wasUserInputRef.current = true;
      onChangeRef.current((el as any).value ?? "");
    };
    el.addEventListener("input", onInput);

    return () => {
      console.log("[MathInput] CLEANUP — removing listener (element will be recreated)");
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
      console.log("[MathInput] SYNC effect — setting value externally", { before: (el as any).value, after: value });
      (el as any).value = value;
    }
  }, [value, showMathField]);

  useEffect(() => {
    if (!showMathField) return;
    const el = ref.current;
    if (!el) return;

    const onKeyboardToggle = () => {
      requestAnimationFrame(() => el?.focus());
    };

    el.addEventListener("virtual-keyboard-toggle", onKeyboardToggle);
    return () => el.removeEventListener("virtual-keyboard-toggle", onKeyboardToggle);
  }, [showMathField]);

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
    key: "math-field",
    ref,
    className,
    disabled,
    placeholder: placeholder ?? "",
    "math-virtual-keyboard-policy": "manual",
  });
}, (prev, next) => {
  return prev.value === next.value
    && prev.mathMode === next.mathMode
    && prev.disabled === next.disabled
    && prev.className === next.className
    && prev.placeholder === next.placeholder;
});
