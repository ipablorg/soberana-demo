import { SettingsView } from '../components/SettingsView';

/**
 * SettingsPage — thin wrapper for the legacy `/suite/settings` route.
 * Delegates entirely to `SettingsView`, which is the embeddable
 * surface used by the desktop SuiteShell.
 */
export default function Settings() {
  return <SettingsView />;
}
