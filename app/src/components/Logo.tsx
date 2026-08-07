import { Link } from "@tanstack/react-router";

const BLUELEARN_OFFICIAL = import.meta.env.VITE_BLUELEARN_OFFICIAL;

const [lightSrc, darkSrc] =
  BLUELEARN_OFFICIAL == "true"
    ? ["/assets/logo/og/logo-og-grad.svg", "/assets/logo/og/logo-og-pb.svg"]
    : ["/assets/logo/ce/logo-ce-dark.svg", "/assets/logo/ce/logo-ce-light.svg"];

// The server can't know the visitor's theme, so both marks are rendered and the
// dark class on <html> picks one. Choosing in JS instead would render the
// light mark into the SSR markup and leave it there until something remounts.
export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img src={lightSrc} className="h-8 dark:hidden" />
      <img src={darkSrc} className="hidden h-8 dark:block" />
    </Link>
  );
};
