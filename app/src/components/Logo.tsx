import { Link } from "@tanstack/react-router";
import { useTheme } from "@/lib/themeProvider";

const BLUELEARN_OFFICIAL = import.meta.env.VITE_BLUELEARN_OFFICIAL;

export const Logo = () => {
  const { theme } = useTheme();

  if (BLUELEARN_OFFICIAL == "true") {
    return theme == "light" ? (
      <Link to="/" className="flex items-center gap-3">
        <img src={`/assets/logo/og/logo-og-grad.svg`} className="h-8" />
      </Link>
    ) : (
      <Link to="/" className="flex items-center gap-3">
        <img src={`/assets/logo/og/logo-og-pb.svg`} className="h-8" />
      </Link>
    );
  } else {
    return theme == "light" ? (
      <Link to="/" className="flex items-center gap-3">
        <img src={`/assets/logo/ce/logo-ce-dark.svg`} className="h-8" />
      </Link>
    ) : (
      <Link to="/" className="flex items-center gap-3">
        <img src={`/assets/logo/ce/logo-ce-light.svg`} className="h-8" />
      </Link>
    );
  }
};
