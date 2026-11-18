#!/usr/bin/env python3
"""
Script para extraer datos del Playbook PDF de Nium y generar un JSON estructurado.
"""

import json
import re
from typing import Dict, List, Optional, Any

# Definición de regiones por país
REGIONS = {
    # África
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
    
    # Asia
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
    
    # Europa
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
    
    # Norteamérica
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
    
    # Sudamérica
    "Argentina": "Sudamérica", "Bolivia": "Sudamérica", "Brazil": "Sudamérica",
    "Chile": "Sudamérica", "Colombia": "Sudamérica", "Curaçao": "Sudamérica",
    "Ecuador": "Sudamérica", "Falkland Islands (Malvinas)": "Sudamérica",
    "French Guiana": "Sudamérica", "Guyana": "Sudamérica", "Paraguay": "Sudamérica",
    "Peru": "Sudamérica", "Suriname": "Sudamérica", "Uruguay": "Sudamérica",
    
    # Oceanía
    "American Samoa": "Oceanía", "Australia": "Oceanía", "Cook Islands": "Oceanía",
    "Fiji": "Oceanía", "French Polynesia": "Oceanía", "Kiribati": "Oceanía",
    "Micronesia, Federated States of": "Oceanía", "Nauru": "Oceanía", "New Caledonia": "Oceanía",
    "New Zealand": "Oceanía", "Niue": "Oceanía", "Norfolk Island": "Oceanía",
    "Northern Mariana Islands": "Oceanía", "Palau": "Oceanía", "Papua New Guinea": "Oceanía",
    "Pitcairn": "Oceanía", "Samoa": "Oceanía", "Solomon Islands": "Oceanía",
    "Tokelau": "Oceanía", "Tonga": "Oceanía", "Tuvalu": "Oceanía", "Vanuatu": "Oceanía",
    "Wallis and Futuna Islands": "Oceanía",
}


def clean_text(text: str) -> str:
    """Limpia el texto de caracteres especiales y espacios extras."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_between(text: str, start: str, end: str) -> Optional[str]:
    """Extrae texto entre dos marcadores."""
    pattern = f"{re.escape(start)}(.*?){re.escape(end)}"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return clean_text(match.group(1))
    return None


def parse_limits(text: str) -> Dict[str, Dict[str, str]]:
    """Parsea los límites de pago."""
    limits = {}
    
    # Buscar patrón de límites
    # Formato típico: LimitsB2B B2P P2P P2B\nMin ... ... ... ...\nMax ... ... ... ...
    
    # Detectar tipos de pago disponibles
    limit_types = []
    if "B2B" in text:
        limit_types.append("B2B")
    if "B2P" in text:
        limit_types.append("B2P")
    if "P2P" in text:
        limit_types.append("P2P")
    if "P2B" in text:
        limit_types.append("P2B")
    
    # Buscar valores min/max
    min_pattern = r'Min\s+([\w\s,\.]+?)(?=Max|$)'
    max_pattern = r'Max\s+([\w\s,\.]+?)(?=Pay-out|$|Go to Contents)'
    
    min_match = re.search(min_pattern, text, re.IGNORECASE | re.DOTALL)
    max_match = re.search(max_pattern, text, re.IGNORECASE | re.DOTALL)
    
    if min_match and max_match:
        min_values = re.findall(r'([A-Z]{3}\s*[\d,\.]+|[\d,\.]+|No limit)', min_match.group(1))
        max_values = re.findall(r'([A-Z]{3}\s*[\d,\.]+|[\d,\.]+|No limit)', max_match.group(1))
        
        for i, ptype in enumerate(limit_types):
            if i < len(min_values) and i < len(max_values):
                limits[ptype] = {
                    "min": clean_text(min_values[i]),
                    "max": clean_text(max_values[i])
                }
    
    return limits


def parse_mandatory_data(text: str) -> List[str]:
    """Parsea los datos obligatorios."""
    data = []
    
    # Campos comunes
    fields = [
        "Remitter Name", "Remitter Account Type", "Remitter Country Code",
        "Remitter Identification Type", "Remitter Identification Number",
        "Remitter Address", "Beneficiary Name", "Beneficiary Account Type",
        "Beneficiary Account Number", "Beneficiary Address", "Beneficiary Country Code",
        "Beneficiary City", "Beneficiary Postcode", "Beneficiary Contact Number",
        "Beneficiary Card Number", "Routing Code Type 1", "Routing Code Value 1",
        "Routing Code Type 2", "Routing Code Value 2", "Remit Purpose Code",
        "Routing Code Type 1 - SWIFT Code", "Routing Code Type 1 - WALLET",
        "Routing Code Value - Wallet Name", "Beneficiary Bank Code",
        "Beneficiary Branch Code", "Beneficiary Account Name"
    ]
    
    for field in fields:
        if field in text:
            data.append(field)
    
    return data


def parse_payment_section(text: str) -> Dict[str, Any]:
    """Parsea una sección de método de pago."""
    section = {}
    
    # Extraer método de pago
    method_pattern = r'Pay-out\s*MethodÿMETHOD|Pay-out\s*Method\s*([A-Z\s\(\)]+)'
    method_match = re.search(method_pattern, text)
    if method_match:
        method = method_match.group(1) if method_match.group(1) else ""
        section["método_pago"] = clean_text(method)
    
    # Extraer moneda
    currency_pattern = r'Currency\s*([A-Z,\s]+?)(?=Pay-out|$)'
    currency_match = re.search(currency_pattern, text)
    if currency_match:
        section["monedas_pago"] = clean_text(currency_match.group(1))
    
    # Extraer Network Participant
    np_pattern = r'Network Participant\s*([^\n]+)'
    np_match = re.search(np_pattern, text)
    if np_match:
        section["red_participante"] = clean_text(np_match.group(1))
    
    # Extraer FX Source
    fx_pattern = r'FX Source\s*([^\n]+)'
    fx_match = re.search(fx_pattern, text)
    if fx_match:
        section["fuente_fx"] = clean_text(fx_match.group(1))
    
    # Extraer Channels
    channels_pattern = r'Channels\s*([^\n]+)'
    channels_match = re.search(channels_pattern, text)
    if channels_match:
        section["canales"] = clean_text(channels_match.group(1))
    
    # Extraer Payment types
    pt_pattern = r'Payment types\s*([^\n]+)'
    pt_match = re.search(pt_pattern, text)
    if pt_match:
        section["tipos_pago"] = clean_text(pt_match.group(1))
    
    # Extraer Cut off & delivery timing
    cutoff_pattern = r'Cut off & delivery\s*timing\s*([^\n]+(?:\n[^\n]+)*?)(?=Mandatory|$)'
    cutoff_match = re.search(cutoff_pattern, text)
    if cutoff_match:
        section["corte_entrega"] = clean_text(cutoff_match.group(1))
    
    # Extraer Mandatory data requirements
    mandatory_data = parse_mandatory_data(text)
    if mandatory_data:
        section["datos_obligatorios"] = mandatory_data
    
    # Extraer Supporting Documents
    sd_pattern = r'Supporting\s*Documents\s*([^\n]+(?:\n[^\n]+)*?)(?=Beneficiary|$)'
    sd_match = re.search(sd_pattern, text)
    if sd_match:
        section["documentos_soporte"] = clean_text(sd_match.group(1))
    
    # Extraer Beneficiary Statement Narrative
    bsn_pattern = r'Beneficiary\s*Statement Narrative\s*([^\n]+(?:\n[^\n]+)*?)(?=Proof|Notes|Limits|$)'
    bsn_match = re.search(bsn_pattern, text)
    if bsn_match:
        section["narrativa_beneficiario"] = clean_text(bsn_match.group(1))
    
    # Extraer Proof of Payment (si existe)
    pop_pattern = r'Proof of Payment\s*([^\n]+(?:\n[^\n]+)*?)(?=Notes|Limits|$)'
    pop_match = re.search(pop_pattern, text)
    if pop_match:
        section["prueba_pago"] = clean_text(pop_match.group(1))
    
    # Extraer Notes (si existe)
    notes_pattern = r'Notes\s*([^\n]+(?:\n[^\n]+)*?)(?=Limits|$)'
    notes_match = re.search(notes_pattern, text)
    if notes_match:
        section["notas"] = clean_text(notes_match.group(1))
    
    # Extraer Limits
    limits = parse_limits(text)
    if limits:
        section["límites"] = limits
    
    return section


def process_playbook(text: str) -> Dict[str, Any]:
    """Procesa el texto completo del playbook."""
    playbook = {"playbook": {}}
    
    # Dividir por países
    # Los países aparecen como "NombrePaís \nPay-out"
    country_sections = re.split(r'\n=== PAGE \d+ ===\n', text)
    
    current_country = None
    current_sections = []
    
    for page_text in country_sections:
        # Detectar si es una nueva página de país
        for country_name in REGIONS.keys():
            if page_text.strip().startswith(country_name):
                # Guardar país anterior si existe
                if current_country and current_sections:
                    playbook["playbook"][current_country] = {
                        "región": REGIONS.get(current_country, "Desconocida"),
                        "secciones": current_sections
                    }
                
                current_country = country_name
                current_sections = []
                break
        
        # Parsear secciones de pago en la página actual
        if current_country:
            # Dividir por métodos de pago
            payment_sections = re.split(r'(?=Pay-out\s*Currency)', page_text)
            
            for ps in payment_sections:
                if "Pay-out" in ps and "Method" in ps:
                    section = parse_payment_section(ps)
                    if section.get("método_pago"):
                        current_sections.append(section)
    
    # Guardar último país
    if current_country and current_sections:
        playbook["playbook"][current_country] = {
            "región": REGIONS.get(current_country, "Desconocida"),
            "secciones": current_sections
        }
    
    return playbook


if __name__ == "__main__":
    # Leer texto extraído
    with open("/tmp/playbook_full_text.txt", "r", encoding="utf-8") as f:
        text = f.read()
    
    print(f"Procesando {len(text)} caracteres...")
    
    # Procesar playbook
    result = process_playbook(text)
    
    # Guardar resultado
    output_path = "/Users/ipablorg/Documents/projects/loopayx/suite-loopay-front/src/data/playbook-payout.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"JSON guardado en: {output_path}")
    print(f"Países procesados: {len(result['playbook'])}")
