#!/usr/bin/env python3
"""
Script final para extraer datos del Playbook PDF de Nium.
Genera un JSON estructurado con información de Pay-out por país.
"""

import PyPDF2
import json
import re
from typing import Dict, List, Optional, Any

# Regiones por país
REGIONS = {
    "Algeria": "África", "Angola": "África", "Benin": "África", "Botswana": "África",
    "Burkina Faso": "África", "Burundi": "África", "Cameroon": "África", "Cape Verde": "África",
    "Chad": "África", "Comoros": "África", "Djibouti": "África", "Egypt": "África",
    "Equatorial Guinea": "África", "Eritrea": "África", "Gabon": "África", "Gambia": "África",
    "Ghana": "África", "Guinea": "África", "Ivory Coast": "África", "Kenya": "África",
    "Lesotho": "África", "Liberia": "África", "Madagascar": "África", "Malawi": "África",
    "Mauritania": "África", "Mauritius": "África", "Morocco": "África", "Mozambique": "África",
    "Namibia": "África", "Niger": "África", "Nigeria": "África", "Republic of the Congo": "África",
    "Reunion": "África", "Rwanda": "África", "Sao Tome and Principe": "África", "Senegal": "África",
    "Seychelles": "África", "Sierra Leone": "África", "South Africa": "África", "Swaziland": "África",
    "Tanzania": "África", "Togo": "África", "Tunisia": "África", "Uganda": "África",
    "Western Sahara": "África", "Zambia": "África",
    "Armenia": "Asia", "Bahrain": "Asia", "Bangladesh": "Asia", "Bhutan": "Asia",
    "Brunei": "Asia", "Cambodia": "Asia", "China": "Asia", "Christmas Island": "Asia",
    "Cocos (Keeling) Islands": "Asia", "Democratic Republic of Timor-Leste": "Asia",
    "Diego Garcia": "Asia", "Georgia": "Asia", "Guam": "Asia", "Hong Kong": "Asia",
    "India": "Asia", "Indonesia": "Asia", "Israel": "Asia", "Japan": "Asia",
    "Jordan": "Asia", "Kazakhstan": "Asia", "Kuwait": "Asia", "Kyrgyzstan": "Asia",
    "Laos": "Asia", "Macao": "Asia", "Malaysia": "Asia", "Maldives": "Asia",
    "Mongolia": "Asia", "Nepal": "Asia", "Oman": "Asia", "Pakistan": "Asia",
    "Palestine": "Asia", "Philippines": "Asia", "Qatar": "Asia", "Saudi Arabia": "Asia",
    "Singapore": "Asia", "South Korea": "Asia", "Sri Lanka": "Asia", "Taiwan": "Asia",
    "Tajikistan": "Asia", "Thailand": "Asia", "Turkmenistan": "Asia", "United Arab Emirates": "Asia",
    "Uzbekistan": "Asia", "Vietnam": "Asia",
    "Aland Islands": "Europa", "Albania": "Europa", "Andorra": "Europa", "Austria": "Europa",
    "Azerbaijan": "Europa", "Bailiwick of Guernsey": "Europa", "Belgium": "Europa",
    "Bosnia and Herzegovina": "Europa", "Bulgaria": "Europa", "Croatia (Hrvatska)": "Europa",
    "Cyprus": "Europa", "Czech Republic": "Europa", "Denmark": "Europa", "Estonia": "Europa",
    "Finland": "Europa", "France": "Europa", "Germany": "Europa", "Gibraltar": "Europa",
    "Greece": "Europa", "Hungary": "Europa", "Iceland": "Europa", "Ireland": "Europa",
    "Isle of Man": "Europa", "Italy": "Europa", "Jersey": "Europa", "Kosovo": "Europa",
    "Latvia": "Europa", "Liechtenstein": "Europa", "Lithuania": "Europa", "Luxembourg": "Europa",
    "Macedonia": "Europa", "Malta": "Europa", "Moldova": "Europa", "Monaco": "Europa",
    "Montenegro": "Europa", "Netherlands": "Europa", "Norway": "Europa", "Poland": "Europa",
    "Portugal": "Europa", "Romania": "Europa", "San Marino": "Europa", "Serbia": "Europa",
    "Slovakia": "Europa", "Slovenia": "Europa", "Spain": "Europa", "Svalbard and Jan Mayen Islands": "Europa",
    "Sweden": "Europa", "Switzerland": "Europa", "Turkey": "Europa", "Ukraine": "Europa",
    "United Kingdom": "Europa", "Vatican City State": "Europa",
    "Anguilla": "Norteamérica", "Antigua": "Norteamérica", "Aruba": "Norteamérica",
    "Bahamas": "Norteamérica", "Barbados": "Norteamérica", "Belize": "Norteamérica",
    "Bermuda": "Norteamérica", "Bonaire, Sint Eustatius and Saba": "Norteamérica",
    "British Virgin Islands": "Norteamérica", "Canada": "Norteamérica",
    "Caribbean Netherlands": "Norteamérica", "Cayman Islands": "Norteamérica",
    "Costa Rica": "Norteamérica", "Dominica": "Norteamérica", "Dominican Republic": "Norteamérica",
    "El Salvador": "Norteamérica", "Greenland": "Norteamérica", "Grenada": "Norteamérica",
    "Guadeloupe": "Norteamérica", "Guatemala": "Norteamérica", "Honduras": "Norteamérica",
    "Jamaica": "Norteamérica", "Martinique": "Norteamérica", "Mexico": "Norteamérica",
    "Montserrat": "Norteamérica", "Nicaragua": "Norteamérica", "Panama": "Norteamérica",
    "Puerto Rico": "Norteamérica", "Saint Kitts and Nevis": "Norteamérica",
    "Saint Lucia": "Norteamérica", "Saint Martin (French part)": "Norteamérica",
    "Saint Vincent and the Grenadines": "Norteamérica", "Sint Maarten (Dutch part)": "Norteamérica",
    "Trinidad and Tobago": "Norteamérica", "Turks and Caicos Islands": "Norteamérica",
    "United States Minor Outlying Islands": "Norteamérica", "United States of America": "Norteamérica",
    "Virgin Islands (U.S.)": "Norteamérica",
    "Argentina": "Sudamérica", "Bolivia": "Sudamérica", "Brazil": "Sudamérica",
    "Chile": "Sudamérica", "Colombia": "Sudamérica", "Curaçao": "Sudamérica",
    "Ecuador": "Sudamérica", "Falkland Islands (Malvinas)": "Sudamérica",
    "French Guiana": "Sudamérica", "Guyana": "Sudamérica", "Paraguay": "Sudamérica",
    "Peru": "Sudamérica", "Suriname": "Sudamérica", "Uruguay": "Sudamérica",
    "American Samoa": "Oceanía", "Australia": "Oceanía", "Cook Islands": "Oceanía",
    "Fiji": "Oceanía", "French Polynesia": "Oceanía", "Kiribati": "Oceanía",
    "Micronesia, Federated States of": "Oceanía", "Nauru": "Oceanía", "New Caledonia": "Oceanía",
    "New Zealand": "Oceanía", "Niue": "Oceanía", "Norfolk Island": "Oceanía",
    "Northern Mariana Islands": "Oceanía", "Palau": "Oceanía", "Papua New Guinea": "Oceanía",
    "Pitcairn": "Oceanía", "Samoa": "Oceanía", "Solomon Islands": "Oceanía",
    "Tokelau": "Oceanía", "Tonga": "Oceanía", "Tuvalu": "Oceanía", "Vanuatu": "Oceanía",
    "Wallis and Futuna Islands": "Oceanía",
}

PAYMENT_METHODS = [
    "BANK ACCOUNT (ACH)", "WALLET (WALLET)", "FOREIGN CURRENCY WIRE TRANSFER (SWIFT)",
    "VISA DIRECT", "PROXY (FPS)", "PROXY (BANK ACCOUNT)", "LOCAL CURRENCY WIRE TRANSFER",
    "PROXY (DUITNOW)", "PROXY (PIX)", "CASH PAYOUT (CASH)", "UNION PAY CARD (CARD)",
    "BANK ACCOUNT (SEPA)", "INTERAC", "BANK ACCOUNT (RTP)", "BANK ACCOUNT (FEDWIRE)",
    "BANK ACCOUNT (IMPS)", "BANK ACCOUNT (UPI)", "BANK ACCOUNT (NEFT)", "BANK ACCOUNT (RTGS)",
    "BANK ACCOUNT (FASTER PAYMENT)", "BANK ACCOUNT (BACS)", "BANK ACCOUNT (CHAPS)",
    "PROXY (PAYNOW)", "PROXY (PROMPTPAY)", "PROXY (INSTAPAY)", "PROXY (PESONET)",
    "MASTERCARD SEND", "BANK ACCOUNT (NPP)", "BANK ACCOUNT (CIPS)", "PROXY (QRIS)",
    "BANK ACCOUNT (EFT)", "BANK ACCOUNT (FAST)", "BANK ACCOUNT (GIRO)", "PROXY (GIRO)",
    "BANK ACCOUNT (SPEI)", "BANK ACCOUNT (TRANSFER)", "BANK ACCOUNT (IBFT)", "BANK ACCOUNT (SIC)",
    "BANK ACCOUNT (SEPA INSTANT)", "BANK ACCOUNT (P27)", "PROXY (VERA)", "BANK ACCOUNT (LOCAL)",
    "PROXY (MOBILE)", "BANK ACCOUNT (RTGS/NEFT)"
]


def clean_text(text: str) -> str:
    """Limpia texto de caracteres especiales."""
    if not text:
        return ""
    text = re.sub(r'Go to Contents © Nium Pte\. Ltd\. All Rights Reserved \| \d+', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_payment_method(text: str) -> Optional[str]:
    """Extrae el método de pago del texto."""
    for method in sorted(PAYMENT_METHODS, key=len, reverse=True):
        if method in text:
            return method
    return None


def extract_currency(text: str) -> Optional[str]:
    """Extrae las monedas de pago."""
    match = re.search(r'Currency\s*([A-Z]{3}(?:[,\s]+[A-Z]{3})*)', text)
    if match:
        currencies = re.findall(r'[A-Z]{3}', match.group(1))
        return ', '.join(currencies) if currencies else None
    return None


def extract_limits(text: str) -> Dict[str, Dict[str, str]]:
    """Extrae los límites de pago."""
    limits = {}
    
    limits_match = re.search(r'Limits\s*((?:B2B|B2P|P2P|P2B)[\s\S]+?)(?=Pay-out\s*Currency|$)', text)
    if not limits_match:
        return limits
    
    section_text = limits_match.group(1)
    
    # Detectar tipos de pago en el header
    payment_types = []
    header_match = re.search(r'^([A-Z0-9\s]+)', section_text)
    if header_match:
        for pt in ["B2B", "B2P", "P2P", "P2B"]:
            if pt in header_match.group(1):
                payment_types.append(pt)
    
    if not payment_types:
        return limits
    
    min_match = re.search(r'Min\s+(.+?)(?=Max)', section_text, re.DOTALL)
    max_match = re.search(r'Max\s+(.+?)(?=Pay-out|$)', section_text, re.DOTALL)
    
    if min_match and max_match:
        min_vals = re.findall(r'([A-Z]{3}\s*[\d,\.]+|[\d,\.]+|No limit)', min_match.group(1))
        max_vals = re.findall(r'([A-Z]{3}\s*[\d,\.]+|[\d,\.]+|No limit)', max_match.group(1))
        
        for i, pt in enumerate(payment_types):
            if i < len(min_vals) and i < len(max_vals):
                limits[pt] = {
                    "min": clean_text(min_vals[i]),
                    "max": clean_text(max_vals[i])
                }
    
    return limits


def extract_mandatory_data(text: str) -> List[str]:
    """Extrae los datos obligatorios."""
    section = re.search(r'Mandatory data\s*requirements?\s*(.+?)(?=Supporting|Beneficiary\s*Statement|Proof|Notes|Limits|$)', 
                        text, re.DOTALL | re.IGNORECASE)
    if not section:
        return []
    
    section_text = section.group(1)
    data = []
    
    fields = [
        "Remitter Name", "Remitter Account Type", "Remitter Country Code",
        "Remitter Identification Type", "Remitter Identification Number", "Remitter Address",
        "Remitter City", "Remitter State", "Remitter Post Code", "Remitter Postcode",
        "Remitter Date of Birth",
        "Beneficiary Name", "Beneficiary Account Type", "Beneficiary Account Number",
        "Beneficiary Address", "Beneficiary Country Code", "Beneficiary City",
        "Beneficiary Postcode", "Beneficiary Post Code", "Beneficiary Contact Number", 
        "Beneficiary Contact No", "Beneficiary Card Number",
        "Beneficiary Bank Code", "Beneficiary Branch Code", "Beneficiary Account Name",
        "Beneficiary Bank Name", "Beneficiary State", "Beneficiary District",
        "Routing Code Type 1", "Routing Code Value 1", "Routing Code Type 2", "Routing Code Value 2",
        "Remit Purpose Code", "Proxy Value", "Proxy Type"
    ]
    
    for field in fields:
        if field.lower() in section_text.lower():
            # Normalizar nombres de campos
            normalized = field.replace("Post Code", "Postcode").replace("Contact No", "Contact Number")
            if normalized not in data:
                data.append(normalized)
    
    return data


def parse_payment_section(text: str) -> Dict[str, Any]:
    """Parsea una sección de método de pago."""
    section = {}
    
    # Método de pago
    method = extract_payment_method(text)
    if method:
        section["método_pago"] = method
    
    # Monedas
    currency = extract_currency(text)
    if currency:
        section["monedas_pago"] = currency
    
    # Network Participant
    np_match = re.search(r'Network Participant\s*(\w+)', text)
    if np_match:
        section["red_participante"] = np_match.group(1)
    
    # FX Source
    fx_match = re.search(r'FX Source\s*(.+?)(?=Channels|Payment types|Cut off|Account)', text, re.DOTALL)
    if fx_match:
        section["fuente_fx"] = clean_text(fx_match.group(1))
    
    # Channels
    ch_match = re.search(r'Channels\s*(.+?)(?=Payment types|Cut off|Account|Mandatory)', text, re.DOTALL)
    if ch_match:
        section["canales"] = clean_text(ch_match.group(1))
    
    # Payment types
    pt_match = re.search(r'Payment types\s*([A-Z0-9,\s]+?)(?=Cut off|Mandatory|Account)', text)
    if pt_match:
        section["tipos_pago"] = clean_text(pt_match.group(1))
    
    # Cut off & delivery timing
    cutoff_match = re.search(r'Cut off & delivery\s*timing\s*(.+?)(?=Mandatory|Supporting|Account)', text, re.DOTALL)
    if cutoff_match:
        section["corte_entrega"] = clean_text(cutoff_match.group(1))
    
    # Mandatory data
    mandatory = extract_mandatory_data(text)
    if mandatory:
        section["datos_obligatorios"] = mandatory
    
    # Supporting Documents
    sd_match = re.search(r'Supporting\s*Documents?\s*(.+?)(?=Beneficiary\s*Statement|Proof|Notes|Limits)', text, re.DOTALL | re.IGNORECASE)
    if sd_match:
        val = clean_text(sd_match.group(1))
        if val and len(val) > 10:
            section["documentos_soporte"] = val
    
    # Beneficiary Statement Narrative
    bsn_match = re.search(r'Beneficiary\s*Statement\s*Narrative\s*(.+?)(?=Proof|Notes|Limits)', text, re.DOTALL | re.IGNORECASE)
    if bsn_match:
        val = clean_text(bsn_match.group(1))
        if val and len(val) > 10:
            section["narrativa_beneficiario"] = val
    
    # Proof of Payment
    pop_match = re.search(r'Proof of Payment\s*(.+?)(?=Notes|Limits)', text, re.DOTALL | re.IGNORECASE)
    if pop_match:
        val = clean_text(pop_match.group(1))
        if val and len(val) > 5:
            section["prueba_pago"] = val
    
    # Notes
    notes_match = re.search(r'Notes\s*(.+?)(?=Limits)', text, re.DOTALL | re.IGNORECASE)
    if notes_match:
        val = clean_text(notes_match.group(1))
        if val and len(val) > 10:
            section["notas"] = val
    
    # Limits
    limits = extract_limits(text)
    if limits:
        section["límites"] = limits
    
    return section


def main():
    pdf_path = "/Users/ipablorg/Documents/projects/loopayx/suite-loopay-front/.cursor/rules/Playbook-FI.pdf"
    
    # Extraer todo el texto del PDF
    print("Extrayendo texto del PDF...")
    full_text = ""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for i, page in enumerate(reader.pages):
            if i < 9:  # Saltar páginas de contenido y changelog
                continue
            text = page.extract_text()
            if text:
                full_text += text + "\n"
    
    print(f"Texto extraído: {len(full_text)} caracteres")
    
    # Crear patrón para dividir por países
    # Los países aparecen como "NombrePaís \n" o "NombrePaís \nPay-out"
    country_pattern = '|'.join([re.escape(c) + r'\s*\n' for c in sorted(REGIONS.keys(), key=len, reverse=True)])
    
    # Dividir el texto por países
    playbook = {"playbook": {}}
    
    # Encontrar todas las posiciones de países
    country_positions = []
    for country in REGIONS.keys():
        # Buscar el país seguido de nueva línea o Pay-out
        pattern = rf'{re.escape(country)}\s*\n\s*Pay-out'
        for match in re.finditer(pattern, full_text):
            country_positions.append((match.start(), country))
    
    # Ordenar por posición
    country_positions.sort(key=lambda x: x[0])
    
    print(f"Países encontrados: {len(country_positions)}")
    
    # Procesar cada país
    for i, (pos, country) in enumerate(country_positions):
        # Determinar el fin del texto de este país
        if i + 1 < len(country_positions):
            end_pos = country_positions[i + 1][0]
        else:
            end_pos = len(full_text)
        
        country_text = full_text[pos:end_pos]
        
        # Dividir por bloques de Pay-out Currency
        blocks = re.split(r'(?=Pay-out\s*Currency)', country_text)
        sections = []
        
        for block in blocks:
            if "Pay-out" in block and "Method" in block and len(block) > 100:
                section = parse_payment_section(block)
                if section.get("método_pago"):
                    # Evitar duplicados
                    key = (section.get("método_pago"), section.get("monedas_pago"))
                    existing_keys = [(s.get("método_pago"), s.get("monedas_pago")) for s in sections]
                    if key not in existing_keys:
                        sections.append(section)
        
        if sections:
            playbook["playbook"][country] = {
                "región": REGIONS.get(country, "Desconocida"),
                "secciones": sections
            }
    
    # Guardar JSON
    output_path = "/Users/ipablorg/Documents/projects/loopayx/suite-loopay-front/src/data/playbook-payout.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(playbook, f, indent=2, ensure_ascii=False)
    
    # Estadísticas
    total_countries = len(playbook["playbook"])
    total_methods = sum(len(c["secciones"]) for c in playbook["playbook"].values())
    
    # Por región
    by_region = {}
    for country, data in playbook["playbook"].items():
        region = data["región"]
        if region not in by_region:
            by_region[region] = []
        by_region[region].append(country)
    
    print(f"\n{'='*60}")
    print(f"RESUMEN FINAL")
    print(f"{'='*60}")
    print(f"Total países procesados: {total_countries}")
    print(f"Total métodos de pago: {total_methods}")
    print(f"\nPor región:")
    for region in sorted(by_region.keys()):
        countries = by_region[region]
        print(f"  {region}: {len(countries)} países")
    
    print(f"\nJSON guardado: {output_path}")
    
    # Ejemplos
    print(f"\n{'='*60}")
    print(f"EJEMPLOS DE PAÍSES")
    print(f"{'='*60}")
    examples = ["Algeria", "Australia", "Brazil", "United States of America", 
                "Germany", "India", "United Kingdom", "Japan", "New Zealand", "Mexico"]
    for country in examples:
        if country in playbook["playbook"]:
            data = playbook["playbook"][country]
            print(f"\n{country} ({data['región']}):")
            for s in data["secciones"]:
                method = s.get("método_pago", "N/A")
                currency = s.get("monedas_pago", "N/A")
                limits = s.get("límites", {})
                limit_info = ""
                if limits:
                    b2b = limits.get("B2B", {})
                    if b2b:
                        limit_info = f" | Límites B2B: {b2b.get('min', 'N/A')} - {b2b.get('max', 'N/A')}"
                print(f"  • {method} [{currency}]{limit_info}")


if __name__ == "__main__":
    main()
