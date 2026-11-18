import { Trans } from '@lingui/react/macro';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';

const AUTH_APPS = [
  {
    name: 'Google Authenticator',
    ios: 'https://apps.apple.com/app/google-authenticator/id388497605',
    android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
  },
  {
    name: 'Authy',
    ios: 'https://apps.apple.com/app/authy/id494168017',
    android: 'https://play.google.com/store/apps/details?id=com.authy.authy',
  },
  {
    name: 'Microsoft Authenticator',
    ios: 'https://apps.apple.com/app/microsoft-authenticator/id983156458',
    android: 'https://play.google.com/store/apps/details?id=com.azure.authenticator',
  },
] as const;

function AuthAppLinks() {
  return (
    <ul className="space-y-2">
      {AUTH_APPS.map((app) => (
        <li key={app.name} className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{app.name}</span>
          {' · '}
          <a
            href={app.ios}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            iOS
          </a>
          {' · '}
          <a
            href={app.android}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Android
          </a>
        </li>
      ))}
    </ul>
  );
}

interface TotpAuthHelpProps {
  mode: 'verify' | 'enroll';
}

export function TotpAuthHelp({ mode }: TotpAuthHelpProps) {
  if (mode === 'enroll') {
    return (
      <div className="w-full space-y-4 rounded-lg bg-muted/40 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            <Trans>Before you scan</Trans>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <Trans>
              Install an authenticator app on your phone. After scanning, your account will appear
              as <span className="font-medium text-foreground">Soberana</span> — not Airbnb or
              another service.
            </Trans>
          </p>
        </div>

        <AuthAppLinks />

        <ol className="list-decimal space-y-2 pl-4 text-xs text-muted-foreground">
          <li>
            <Trans>Download one of the apps above.</Trans>
          </li>
          <li>
            <Trans>Open it and tap “Add account” or the + button.</Trans>
          </li>
          <li>
            <Trans>Scan the QR code on this screen.</Trans>
          </li>
          <li>
            <Trans>
              If you can&apos;t scan, copy the setup link below the QR code and open it on your
              phone.
            </Trans>
          </li>
          <li>
            <Trans>
              Confirm you see <span className="font-medium text-foreground">Soberana</span> in the
              app, then enter the 6-digit code here.
            </Trans>
          </li>
        </ol>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-lg bg-muted/40 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          <Trans>The code is on your phone</Trans>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <Trans>
            Loopay cannot show it here. Open the security app you set up when you registered and
            look for <span className="font-medium text-foreground">Soberana</span> or your email.
          </Trans>
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="find-code" className="border-border">
          <AccordionTrigger className="py-2 text-sm hover:no-underline">
            <Trans>How do I find the code?</Trans>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <ol className="list-decimal space-y-2 pl-4 text-xs text-muted-foreground">
              <li>
                <Trans>On your phone, search for “Authenticator”, “Authy”, or “Microsoft”.</Trans>
              </li>
              <li>
                <Trans>Open the app and find the account named Soberana or your email.</Trans>
              </li>
              <li>
                <Trans>Copy the 6-digit number — it changes every 30 seconds.</Trans>
              </li>
              <li>
                <Trans>Paste it here before it expires.</Trans>
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="wrong-app" className="border-border">
          <AccordionTrigger className="py-2 text-sm hover:no-underline">
            <Trans>I only see other apps (Airbnb, Gmail…)</Trans>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <p className="text-xs text-muted-foreground">
              <Trans>
                Those apps are unrelated. Your Loopay code lives inside a dedicated authenticator
                app — not inside Airbnb, your bank, or email. Search your phone for Google
                Authenticator, Authy, or Microsoft Authenticator.
              </Trans>
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="apple-passwords" className="border-border">
          <AccordionTrigger className="py-2 text-sm hover:no-underline">
            <Trans>I use Apple Passwords / iCloud Keychain</Trans>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <p className="text-xs text-muted-foreground">
              <Trans>
                Open Settings → Passwords and search for Soberana or Loopay — not Airbnb or other
                sites. Each saved account has its own verification code. Using Airbnb&apos;s code
                here will always fail.
              </Trans>
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lost-access" className="border-0">
          <AccordionTrigger className="py-2 text-sm hover:no-underline">
            <Trans>I lost my phone or deleted the app</Trans>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <p className="text-xs text-muted-foreground">
              <Trans>
                For security we cannot resend the QR code. Contact support with the email you use
                to sign in and we will help you recover access.
              </Trans>
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
