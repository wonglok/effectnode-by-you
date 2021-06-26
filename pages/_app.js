import "../styles/globals.css";
import "tailwindcss/tailwind.css";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
