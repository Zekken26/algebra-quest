type SettingsPanelProps = {
  children: React.ReactNode;
  title?: string;
};

export function SettingsPanel({ children, title = "Settings" }: SettingsPanelProps) {
  return (
    <section className="teacher-card p-5">
      <h3 className="font-display text-lg text-primary">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

type SettingsFieldProps = {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
};

export function SettingsField({ label, children, fullWidth }: SettingsFieldProps) {
  return (
    <label className={`grid gap-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-medium text-stone-foreground/80">{label}</span>
      {children}
    </label>
  );
}

type ToggleFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleField({ label, checked, onChange }: ToggleFieldProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      <span className="text-sm text-stone-foreground/80">{label}</span>
    </label>
  );
}
