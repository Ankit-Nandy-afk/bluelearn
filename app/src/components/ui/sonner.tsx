import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { useSyncExternalStore } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { ToasterProps } from "sonner";

const mobileQuery = "(max-width: 639px)";

const subscribeToMobile = (onChange: () => void) => {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getMobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const getServerMobileSnapshot = () => false;

const Toaster = ({ position, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    getServerMobileSnapshot
  );

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position ?? (isMobile ? "top-center" : "bottom-right")}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--title-color": "var(--foreground)",
          "--description-color":
            "color-mix(in srgb, var(--foreground) 85%, transparent)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-popover group-[.toaster]:!text-popover-foreground group-[.toaster]:!border-border group-[.toaster]:!shadow-lg",
          title: "group-[.toast]:font-semibold group-[.toast]:!text-foreground",
          description: "group-[.toast]:!text-foreground/85",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
