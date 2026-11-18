import { describe, expect, it } from 'vitest';

async function readSource(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('landing pages source contract', () => {
  it('locks the crash, branding, navigation and icon-size fixes in source', async () => {
    const readPage = (name: string) => readSource(`../pages/${name}.tsx`);
    const [soberana, remittances, gig, assistant, legacyLanding] = await Promise.all(
      ['soberana-landing', 'remittances', 'gig', 'assistant', 'landing'].map(readPage),
    );

    // N1 — no undeclared loopayLogo identifiers (white-screen ReferenceError class)
    for (const source of [soberana, remittances, gig, assistant, legacyLanding]) {
      expect(source).not.toContain('loopayLogo');
    }

    // B1/B3 — matched-ratio pair: black artwork in light theme, white in dark
    for (const source of [soberana, remittances, gig, assistant]) {
      expect(source).toContain('SOBERANA By Loopay negro 1.png');
      expect(source).toContain('SOBERANA By Loopay blanco 1.png');
    }

    // N2 — unauthorized "Dashboard" targets the real client dashboard route
    const unauthorized = await readSource('../../errors/pages/unauthorized.tsx');
    expect(unauthorized).toContain("'/suite/dashboard'");
    expect(unauthorized).not.toContain("'/dashboard'");

    // N3 — legal content opens in-app via LegalModal, never dead /legal/* anchors
    const completeRegistration = await readSource('../../auth/components/CompleteRegistrationForm.tsx');
    expect(completeRegistration).toContain('<LegalModal ');
    expect(completeRegistration).toContain('TERMS_AND_CONDITIONS_HTML');
    expect(completeRegistration).not.toContain('/legal/');

    // N4 — final CTA opens the register overlay like its hero siblings
    expect(soberana).toContain("<Button variant=\"gradient\" size=\"lg\" onClick={() => setMode('register')}>");
    expect(soberana).not.toMatch(/asChild>\s*<Link to="\/remittances">\s*<Trans>Open your account<\/Trans>/);

    // B4 — inner SVG size matches the Tailwind wrapper intent (h-4→16, h-5→20, h-6→24)
    expect(soberana).toContain('<Icon className="h-4 w-4 icon-gradient" size={16} />');
    expect(soberana).toContain('<Icon className="h-5 w-5 icon-gradient" size={20} />');
    expect(soberana).toContain('<TrendingUp className="h-6 w-6 icon-gradient" size={24} />');
    expect(remittances).toContain('<Icon className="h-5 w-5" size={20} />');
    expect(remittances).toContain('<ArrowRight className="ml-1 h-4 w-4" size={16} />');
    expect(gig).toContain('<Icon className="h-5 w-5" size={20} />');
    expect(gig).toContain('<ArrowRight className="ml-1 h-4 w-4" size={16} />');
    expect(assistant).toMatch(/<ArrowLeft[^>]*size=\{16\}/);
    expect(assistant).toMatch(/<Send[^>]*size=\{16\}/);
    expect((assistant.match(/<Sparkles[^>]*size=\{16\}/g) ?? []).length).toBeGreaterThanOrEqual(2);
    // lucide re-export option icons are sized by classes alone — no blanket size prop
    expect(assistant).toContain('<option.icon className="w-5 h-5" />');
  });
});
