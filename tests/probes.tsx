import { useLocation } from "react-router-dom";

/** Renders the current location.pathname — handy for asserting navigation. */
export function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

/** Renders the current location.state as JSON — handy for asserting state. */
export function StateProbe() {
  const location = useLocation();
  return <div data-testid="location-state">{JSON.stringify(location.state ?? {})}</div>;
}