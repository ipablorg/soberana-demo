import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs', 'payment-initiation.md');
const OUT_PATH = join(ROOT, 'docs', 'payment-initiation.pdf');
const LOGO_BLACK = join(ROOT, 'src', 'shared', 'assets', 'loopay_logos', 'Loopay-LogoBlack.png');

function toBase64(filePath) {
  return readFileSync(filePath).toString('base64');
}

async function main() {
  const logoBase64 = toBase64(LOGO_BLACK);
  const mdContent = readFileSync(MD_PATH, 'utf8');
  const bodyHTML = marked(mdContent, { gfm: true, breaks: false });

  // Let's assume Loopay uses a dark blue or specific branding colors.
  // Loopay usually has a purple/blue brand, but let's stick to clean dark tones with an accent.
  const primaryColor = '#1e3a8a'; // A professional deep blue
  const accentColor = '#3b82f6';
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Soberana - Análisis de Payment Initiation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 10.5pt; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-weight: 400;
    line-height: 1.7;
    color: #111111;
    background: #ffffff;
  }

  .cover-page {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 72px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 5px solid ${primaryColor};
  }
  .cover-logo img { height: 48px; width: auto; margin-bottom: auto; }
  
  .cover-title {
    font-size: 32pt;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: ${primaryColor};
    margin-bottom: 20px;
    margin-top: auto;
  }
  .cover-subtitle {
    font-size: 16pt;
    font-weight: 400;
    color: #475569;
    margin-bottom: 40px;
  }
  .cover-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10pt;
    color: #64748b;
    border-top: 1px solid #cbd5e1;
    padding-top: 20px;
    margin-top: auto;
  }
  
  .page-break { page-break-after: always; break-after: always; }

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0;
    max-width: 720px;
    margin: 0 auto 30px auto;
    border-bottom: 1px solid #e2e8f0;
  }
  .content-header img { height: 28px; width: auto; opacity: 0.8; }
  .header-brand {
    font-size: 10pt;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: ${primaryColor};
    text-transform: uppercase;
  }

  .content {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 0 50px 0;
  }

  h1 { font-size: 20pt; font-weight: 700; color: ${primaryColor}; margin: 20px 0; display: none; } /* Hide h1 since it's in cover */
  h2 { font-size: 16pt; font-weight: 600; color: #0f172a; margin-top: 36px; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
  h3 { font-size: 13pt; font-weight: 600; color: #1e293b; margin-top: 28px; margin-bottom: 12px; }
  p { font-size: 11pt; color: #334155; margin-bottom: 16px; }
  strong { font-weight: 600; color: #0f172a; }
  em { font-style: italic; color: #475569; }
  hr { border: none; border-top: 1px solid #cbd5e1; margin: 32px 0; }

  ul, ol { padding-left: 24px; margin-bottom: 16px; color: #334155; }
  li { font-size: 11pt; margin-bottom: 8px; line-height: 1.6; }
  
  @page {
    size: A4;
    margin: 20mm 20mm 25mm 20mm;
    @bottom-center {
      content: "Soberana by Loopay · Confidencial · Página " counter(page);
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      color: #94a3b8;
    }
  }
  @page :first { margin-bottom: 0; @bottom-center { content: none; } }
</style>
</head>
<body>

<div class="cover-page">
  <div class="cover-logo">
    <img src="data:image/png;base64,${logoBase64}" alt="Loopay" />
  </div>
  <h1 class="cover-title">Análisis de Proveedores:<br>Payment Initiation (Pay-by-Bank)</h1>
  <p class="cover-subtitle">Propuesta Estratégica para Soberana</p>
  <div class="cover-footer">
    <span>Para: Diego Muñoz (CEO) y Gustavo Mejía (Director de Canales)</span>
    <span>15 de Mayo de 2026</span>
  </div>
</div>
<div class="page-break"></div>

<div class="content-header">
  <img src="data:image/png;base64,${logoBase64}" alt="Loopay" />
  <div class="header-brand">Soberana Document</div>
</div>

<div class="content">
${bodyHTML}
</div>

</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: OUT_PATH,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();
  console.log('PDF generated at:', OUT_PATH);
}

main().catch(console.error);