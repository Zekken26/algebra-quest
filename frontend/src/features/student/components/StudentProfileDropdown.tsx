import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Pencil, ScrollText } from "lucide-react";
import { clearAuth } from "@/shared/services/api";

type StudentProfileDropdownProps = {
  open: boolean;
  onClose: () => void;
};

export function StudentProfileDropdown({ open, onClose }: StudentProfileDropdownProps) {
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    onClose();
    navigate({ to: "/login" });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 overflow-hidden rounded-xl border border-primary/25 bg-[oklch(0.18_0.04_165/0.96)] p-1.5 shadow-[0_18px_50px_oklch(0_0_0/0.55)] backdrop-blur-xl sm:top-[calc(100%+0.75rem)] sm:w-56 sm:rounded-2xl sm:p-2"
        >
          <Link
            to="/student/profile/edit"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-stone-foreground/85 transition hover:bg-primary/10 hover:text-primary sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5"
          >
            <Pencil className="h-4 w-4" /> Edit Profile
          </Link>
          <Link
            to="/student/progress"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-stone-foreground/85 transition hover:bg-primary/10 hover:text-primary sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5"
          >
            <ScrollText className="h-4 w-4" /> View Progress
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10 sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
