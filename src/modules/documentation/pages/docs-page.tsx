/**
 * ManifestoPage — Soberana Manifesto v2
 *
 * Gradient classification:
 * - text-gradient-loopay: section titles (gradientTitle) + closing tagline
 * - bg-brand-gradient: ONE brand-moment card ($552B+ market opportunity)
 * - Card variant="gradient-thin": instrument cards + pillar cards (proper mask-trick border)
 * - Plain bg-card border-border: everything else
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { useDocsLanguageStore } from "@/shared/stores/useDocsLanguageStore";
import { DocSection } from "../components";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
  Brain,
  Bot,
  DollarSign,
  Wallet,
  Layers,
  Workflow,
  ArrowRight,
  Globe,
  Zap,
  Clock,
  FileCheck,
  Vault,
  Smartphone,
  CreditCard,
  Building2,
  Landmark,
} from "@/shared/components/animated-icons";

// ─── Bilingual content ──────────────────────────────────────────────────────

const CONTENT = {
  es: {
    hero: {
      eyebrow: "Manifiesto Soberana v2 — Abril 2026",
      title: "Soberana",
      subtitle:
        "Un acto fundacional sobre el dinero, sobre quién merece controlarlo, y sobre qué clase de infraestructura hace falta para que ese control sea real.",
    },
    sections: {
      problema: {
        title: "El sistema está roto",
        subtitle: "El problema no es el dinero. Es la infraestructura.",
        quote:
          "El sistema que mueve $800B de remesas anuales cobra un promedio del 6,35%. El problema es la infraestructura. La solución es construir una mejor.",
        p1: "El dinero de cualquier empresa que cruza fronteras tiene tres enemigos. La inflación consume valor cada semana. La frontera convierte un pago de cinco segundos en un proceso de cinco días. El banco corresponsal — invisible, lento, siempre presente — cobra por existir y nunca aparece en los informes anuales.",
        p2: "SWIFT cumple cincuenta años. Las cuentas nostro y vostro resuelven un problema de comunicación que ya no existe. Tenemos blockchains que liquidan en tres segundos, y sin embargo el sistema que mueve el capital corporativo funciona con la arquitectura de un telégrafo.",
        p3: "Una empresa mediana que opera cross-border pierde entre 2% y 5% de su volumen en fricción pura. En diez millones de dólares, eso es entre $200K y $500K anuales — no en pérdidas de mercado, en plomería obsoleta. Y el capital que espera en cuenta genera entre 0% y 1% cuando los mercados institucionales ofrecen entre 5% y 8%.",
        enemies: [
          { label: "Inflación", desc: "Erosiona valor cada semana sin excepción" },
          { label: "Frontera", desc: "5 segundos de pago → 5 días de proceso" },
          { label: "Corresponsal", desc: "Invisible, lento, cobra por existir" },
        ],
        stat1: { number: "2–5%", label: "fricción sobre volumen cross-border" },
        stat2: { number: "0–1%", label: "rendimiento en cuenta corporativa global promedio" },
        mercado: {
          number: "$552B+",
          label: "mercado cross-border global para 2033",
          source: "proyección de mercado 2024",
        },
      },
      promesa: {
        title: "El dinero no descansa",
        subtitle:
          "Cada peso en reposo pierde valor. Cada pago que tarda días es una mentira técnica.",
        p1: "El capital dormido tiene un costo real: inflación, tipo de cambio, y oportunidades que no esperan. Los instrumentos para activarlo han estado reservados para fondos institucionales con equipos de diez personas. Soberana los lleva al CFO de una empresa mediana.",
        p2: "Cada peso en la plataforma que no está en tránsito genera rendimiento — automáticamente, con kill switches contra movimientos extremos, con visibilidad total en tiempo real. El dinero trabaja mientras el equipo de tesorería duerme.",
        p3: "Cuando llega el momento de mover capital: el pago cruza la frontera en minutos. Un envío a Brasil liquida antes de que termine la reunión en que se decidió. Zentinel monitorea 50 monedas las 24 horas, propone decisiones, y espera confirmación antes de actuar.",
        flow: [
          { label: "Capital" },
          { label: "Soberana" },
          { label: "Rendimiento automático" },
          { label: "Pago en minutos" },
        ],
        stat1: { number: "5–8%", label: "rendimiento en Soberana Vault" },
        stat2: { number: "50", label: "monedas monitoreadas por Zentinel 24/7" },
      },
      soberania: {
        title: "Sobre la soberanía",
        subtitle:
          "El capital de una empresa no debería depender de decisiones que esa empresa no tomó.",
        p1: "Soberanía financiera no es filosofía — es una descripción operativa. Mover dinero sin pedir permiso. Convertir sin penalizaciones arbitrarias. Proteger sin depender de que el gobierno de turno mantenga sus compromisos.",
        p2: "El mapa de la fragilidad monetaria es global. Argentina restringió el acceso al dólar por decreto. La lira turca perdió el 44% de su valor en 2021 y el 29% más en 2022. El naira nigeriano cayó más del 70% en seis meses en 2023. La libra egipcia perdió el 50% en un solo mes. El peso libanés lleva cinco años bajo controles de capital con una brecha del 1.000% entre la tasa oficial y el mercado paralelo. El tesorero sin instrumentos no toma una decisión de riesgo: asume un riesgo que no eligió.",
        p3: "Soberana responde con stablecoins sobre blockchains que no cierran, tipo de cambio bloqueado en el momento de la decisión (no 48 horas después), rendimiento sobre saldos en espera, y KYC no-bloqueante por principio.",
        compareRows: [
          {
            label: "Liquidación FX",
            before: "48–72 horas después de la orden",
            after: "Tasa bloqueada en el momento",
          },
          {
            label: "Horario",
            before: "L-V, 9–17h por jurisdicción",
            after: "24/7, sin excepciones",
          },
          {
            label: "Compliance",
            before: "Manual, bloquea la operación",
            after: "No-bloqueante por diseño",
          },
          {
            label: "Rendimiento",
            before: "0–1% en cuenta corporativa",
            after: "5–8% en Vault activo",
          },
        ],
        colBefore: "Sistema actual",
        colAfter: "Soberana",
      },
      arquitectura: {
        title: "Una arquitectura, tres pilares",
        subtitle:
          "No construimos un producto. Construimos infraestructura que otros convierten en productos.",
        p1: "La distinción importa. Un producto resuelve un problema para un usuario. La infraestructura crea las condiciones para que miles de actores resuelvan millones de problemas.",
        p2: "Los tres pilares comparten un ledger, el mismo motor de cotizaciones, y la misma capa de inteligencia. Un banco que implementa BaaS y una empresa que usa la plataforma operacional miran el mismo estado desde ángulos distintos.",
        pillars: [
          {
            icon: Layers,
            title: "API de infraestructura",
            desc: "13+ rails: ACH, Wire, PIX, SEPA, SPEI, BRE-B y stablecoins sobre ETH, SOL, Base, Polygon, Tron. Una integración, todos los idiomas financieros.",
          },
          {
            icon: Brain,
            title: "Plataforma operacional",
            desc: "Zentinel (agente de tesorería), Workflow Composer (flujos sin código) y Vault (rendimiento sobre capital en espera). Para CFOs sin equipo de ingeniería.",
          },
          {
            icon: Building2,
            title: "Banking as a Service",
            desc: "Soberana Elements: KYC, retención fiscal y rails globales en cualquier checkout — con el branding del cliente. Tiempo al mercado: 6 semanas vs 18 meses.",
          },
        ],
        rails: {
          title: "La Red Global de Pagos",
          labelFiat: "Rails Fiat",
          labelBlockchain: "Rails Blockchain",
          fiat: [
            { rail: "ACH", region: "Estados Unidos" },
            { rail: "Wire", region: "Global" },
            { rail: "PIX", region: "Brasil" },
            { rail: "SEPA", region: "Europa" },
            { rail: "SPEI", region: "México" },
            { rail: "SWIFT", region: "Global" },
          ],
          blockchain: [
            { chain: "Base", assets: "USDC" },
            { chain: "Ethereum", assets: "USDC, USDT, ETH" },
            { chain: "Solana", assets: "USDC, SOL" },
            { chain: "Polygon", assets: "USDC, USDT" },
          ],
        },
      },
      instrumentos: {
        title: "Los instrumentos",
        subtitle: "Cinco maneras de devolverle al capital lo que le corresponde.",
        p1: "Los instrumentos de Soberana no son funcionalidades de un roadmap — son capacidades operativas que procesan transacciones reales hoy.",
        instruments: [
          {
            icon: Vault,
            name: "Vaults",
            desc: "Capital operativo generando rendimiento institucional. Kill switches automáticos. Transparencia total en tiempo real.",
          },
          {
            icon: Bot,
            name: "Zentinel",
            desc: "Agente de tesorería 24/7. Propone acciones con plan completo — fee, tasa, tiempo de liquidación — y espera confirmación antes de ejecutar.",
          },
          {
            icon: CreditCard,
            name: "Card Pro",
            desc: "Pagos just-in-time: conversión en el milisegundo del gasto. Cero capital pre-fondeado inmovilizado.",
          },
          {
            icon: Workflow,
            name: "Workflow Composer",
            desc: "Nómina internacional, flujos FX, notificaciones contables — diseñados visualmente, ejecutados sin intervención humana.",
          },
          {
            icon: Smartphone,
            name: "Soberana Elements",
            desc: "KYC, retención fiscal y rails globales embebidos en cualquier producto, con branding propio, vía un snippet de código.",
          },
        ],
        workflowTitle: "Paleta del Workflow Composer — 13 categorías, 50+ nodos",
        workflowCategories: [
          { name: "Triggers", nodes: ["Webhook", "Scheduled", "Incoming Payment", "POS Sale"] },
          { name: "Checks", nodes: ["KYC/KYB", "Balance", "Screening", "Compliance"] },
          { name: "Move", nodes: ["PIX", "ACH", "SEPA", "Transfer"] },
          { name: "Change", nodes: ["FX Quote", "FX Execute", "On-ramp", "Off-ramp"] },
          { name: "Vaults", nodes: ["Invertir", "Redimir"] },
          { name: "Compliance", nodes: ["Policy Gate", "Limits", "Address Screening"] },
          { name: "Integrations", nodes: ["ERP", "Accounting", "Webhook", "SFTP"] },
          { name: "Logic", nodes: ["Branch", "Approval", "Notify"] },
        ],
      },
      horizonte: {
        title: "El horizonte técnico",
        subtitle:
          "No especulamos sobre posibilidades abstractas. Extrapolamos primitivos que ya están en producción.",
        p1: "Cada punto del horizonte técnico de Soberana tiene un referente concreto: código en producción, estándares publicados, experimentos institucionales con resultados medibles.",
        techs: [
          {
            icon: Wallet,
            name: "Account Abstraction",
            detail: "ERC-4337 en producción desde 2023. 2M+ smart wallets activas.",
          },
          {
            icon: DollarSign,
            name: "Liquidez programable",
            detail: "Hooks de Uniswap v4 — pools con compliance integrado a nivel de protocolo.",
          },
          {
            icon: FileCheck,
            name: "Identidad soberana",
            detail: "W3C Verifiable Credentials + eIDAS 2.0. KYB portable, verificado una sola vez.",
          },
          {
            icon: Landmark,
            name: "RWA como colateral",
            detail: "BlackRock BUIDL y Ondo T-Bills — activos tokenizados como garantía de crédito JIT.",
          },
          {
            icon: Brain,
            name: "Memoria episódica",
            detail: "Zentinel aprende patrones históricos para pasar de análisis a previsión.",
          },
        ],
      },
      diseno: {
        title: "El diseño como principio",
        subtitle:
          "En fintech, la estética no es cosmética. Es la forma en que la confianza se vuelve visible.",
        quote:
          "Cada pixel que confunde es un pixel que traiciona la confianza del usuario en el momento en que esa confianza importa más.",
        p1: "Los bancos construyen edificios de mármol no por función — por semiótica. El mármol dice: aquí el dinero está seguro, la institución tiene permanencia, las decisiones son sólidas. La interfaz digital de Soberana existe con el mismo principio.",
        p2: "Llamamos a nuestro sistema 'minimalismo confiado': blanco y negro por defecto, color reservado para señales de estado. Cuando un número aparece en verde en el dashboard, el usuario sabe que hay algo importante. Cuando todo es colorido, nada es urgente.",
        principles: [
          {
            icon: Globe,
            name: "Color",
            desc: "B&W de base. Color solo para status: éxito, alerta, error. Nunca decorativo.",
          },
          {
            icon: FileCheck,
            name: "Tipografía",
            desc: "Monoespaciada para datos financieros. Cifras tabulares, alineadas a la derecha. Jerarquía sin iconografía.",
          },
          {
            icon: Zap,
            name: "Espacio",
            desc: "Generoso por convicción. La pantalla de confirmación muestra solo lo que importa en ese momento.",
          },
          {
            icon: Clock,
            name: "Movimiento",
            desc: "150–200ms. ease-out. Solo para cambios de estado. Nunca celebración, siempre información.",
          },
        ],
      },
      audiencias: {
        title: "A quién hablamos",
        subtitle: "Tres actores. El mismo sistema. Conversaciones distintas.",
        p1: "Soberana no tiene un cliente único. Los tres llegan con un problema diferente y la misma constatación: el sistema financiero que tienen no es el que merecen.",
        colBefore: "El dolor",
        colAfter: "La respuesta",
        audiences: [
          {
            icon: Landmark,
            name: "Bancos",
            pains: [
              { before: "Infraestructura legacy que no escala", after: "API moderna + Workflow Builder para orquestación" },
              { before: "Costos de compliance crecientes", after: "KYC/KYB integrado, compliance en workflows" },
              { before: "Tesorería ineficiente", after: "Vaults con rendimiento + Zentinel 24/7" },
            ],
          },
          {
            icon: Zap,
            name: "Fintechs",
            pains: [
              { before: "Construir rails de pago desde cero", after: "13+ rails integrados, un contrato" },
              { before: "Time-to-market de meses", after: "White-label con branding, sandbox el mismo día" },
              { before: "Multi-moneda complejo", after: "Quotes engine con tasa indicativa y bloqueada" },
            ],
          },
          {
            icon: DollarSign,
            name: "Corporativos",
            pains: [
              { before: "Pagos internacionales lentos y caros", after: "Cross-border con settlement < 5 minutos" },
              { before: "Gestión manual de beneficiarios", after: "CRUD con validación por jurisdicción" },
              { before: "Sin visibilidad de tesorería", after: "Dashboard conversacional con FX en tiempo real" },
            ],
          },
        ],
      },
      futuro: {
        title: "2030",
        subtitle:
          "El capital de una empresa en Bogotá genera rendimiento, paga en Lagos, y liquida en Tokio. Sin tocar un banco corresponsal.",
        p1: "En 2030, el corredor bancario corresponsal habrá perdido su rol central — no porque desaparezca, sino porque quedará como el tren de vapor frente al avión: existe, pero nadie que tenga alternativa lo elige.",
        p2: "Una exportadora en Bogotá recibe un pago de Tokio. Llega en USDC en 3 segundos. El Workflow Composer ejecuta automáticamente: 20% a COP para nómina, el resto en Vault hasta que el tipo de cambio cruce el objetivo. Cuando toca pagar en Lagos, Zentinel liquida en nairas en menos de 5 minutos. El tesorero recibe una notificación — no tomó ninguna decisión intermedia.",
        p3: "El onboarding en una nueva institución toma horas. La Verifiable Credential es aceptada en todo el ecosistema. El crédito de capital de trabajo viene de quien procesó sus pagos tres años y vio que siempre pagan a proveedores con cinco días de adelanto.",
        flow: [
          { label: "Pago Tokio → USDC" },
          { label: "Workflow automático" },
          { label: "20% → COP nómina" },
          { label: "Vault rinde" },
        ],
        traccion: [
          { number: "45+", label: "países con cobertura" },
          { number: "1M+", label: "transacciones procesadas" },
          { number: "$2B+", label: "volumen movilizado" },
          { number: "13+", label: "rails de pago" },
          { number: "< 5min", label: "settlement promedio" },
          { number: "50+", label: "monedas soportadas" },
          { number: "5", label: "continentes operativos" },
        ],
        roadmap: {
          labelProd: "En Producción",
          labelDev: "En Desarrollo",
          labelFuture: "Futuro",
          production: [
            "Dashboard conversacional",
            "Receive (on-ramp)",
            "Send (off-ramp)",
            "KYC via Persona",
            "Zentinel chat",
            "Backoffice operativo",
            "API docs interactiva",
          ],
          development: [
            "Vaults live dashboard",
            "Workflow Builder",
            "Soberana Elements",
            "Card Pro",
            "AI Builder",
            "Sales Helper toolkit",
          ],
          future: [
            "Workflow execution engine",
            "Zentinel con autonomía operativa",
            "Vaults multi-estrategia",
            "POS integration",
            "Agent Teams",
            "Mobile app",
          ],
        },
        closing: "Soberana no es lo que construyes sobre la infraestructura.",
        closingTagline: "Es la infraestructura. Cada frontera. Un click.",
      },
    },
  },
  en: {
    hero: {
      eyebrow: "Soberana Manifesto v2 — April 2026",
      title: "Soberana",
      subtitle:
        "A founding document about money, about who deserves to control it, and about what kind of infrastructure makes that control real.",
    },
    sections: {
      problema: {
        title: "The system is broken",
        subtitle: "The problem is not the money. It is the infrastructure.",
        quote:
          "The system that moves $800B in annual remittances charges an average of 6.35%. The problem is the infrastructure. The solution is to build a better one.",
        p1: "The working capital of any company that crosses borders has three permanent enemies. Inflation erodes value every week without exception. The border turns a five-second payment into a five-day process. The correspondent bank — invisible, slow, always present — charges for existing and never appears in annual reports.",
        p2: "SWIFT turns fifty. Nostro and vostro accounts solve a communication problem that no longer exists. We have blockchains that settle in three seconds, yet the system that moves corporate capital runs on telegraph architecture.",
        p3: "A mid-sized company operating cross-border loses 2–5% of its volume to pure friction. On ten million dollars, that is $200K–$500K per year — not market losses, but obsolete plumbing. Meanwhile, capital sitting in a corporate account earns 0–1% when institutional money markets offer 5–8%.",
        enemies: [
          { label: "Inflation", desc: "Erodes value every week without exception" },
          { label: "The border", desc: "5-second payment → 5-day process" },
          { label: "Correspondent", desc: "Invisible, slow, charges for existing" },
        ],
        stat1: { number: "2–5%", label: "friction on cross-border volume" },
        stat2: { number: "0–1%", label: "yield in a corporate bank account (global average)" },
        mercado: {
          number: "$552B+",
          label: "global cross-border market by 2033",
          source: "market projection 2024",
        },
      },
      promesa: {
        title: "Money never rests",
        subtitle:
          "Every idle peso loses value. Every payment that takes days is a technical lie.",
        p1: "Idle capital has a real cost: inflation, exchange rate exposure, and opportunities that do not wait. The instruments to activate it have been reserved for institutional funds with ten-person teams. Soberana puts them in the hands of a mid-market CFO.",
        p2: "Every peso on the platform that is not in transit generates yield — automatically, with kill switches against extreme market moves, with full real-time visibility. Money works while the treasury team sleeps.",
        p3: "When it is time to move capital: the payment crosses the border in minutes. A transfer to Brazil settles before the meeting that decided it ends. Zentinel monitors 50 currencies around the clock, proposes decisions, and waits for confirmation before acting.",
        flow: [
          { label: "Capital" },
          { label: "Soberana" },
          { label: "Automatic yield" },
          { label: "Payment in minutes" },
        ],
        stat1: { number: "5–8%", label: "yield in Soberana Vault" },
        stat2: { number: "50", label: "currencies monitored by Zentinel 24/7" },
      },
      soberania: {
        title: "On sovereignty",
        subtitle:
          "A company's capital should not depend on decisions that company never made.",
        p1: "Financial sovereignty is not philosophy — it is an operational description. Move money without asking permission. Convert without arbitrary penalties. Protect without depending on the current government keeping its monetary promises.",
        p2: "The map of monetary fragility is global. Argentina restricted dollar access by decree. The Turkish lira lost 44% of its value in 2021 and another 29% in 2022. The Nigerian naira fell over 70% in six months in 2023. The Egyptian pound lost 50% in a single month. The Lebanese pound has been under capital controls for five years, with a 1,000% gap between the official and parallel market rates. The treasurer without instruments is not making a risk decision: they are absorbing a risk they never chose.",
        p3: "Soberana answers with stablecoins on blockchains that never close, exchange rates locked at the moment of decision (not 48 hours later), yield on waiting balances, and KYC that is non-blocking by design.",
        compareRows: [
          { label: "FX settlement", before: "48–72 hours after the order", after: "Rate locked at decision time" },
          { label: "Operating hours", before: "Mon–Fri, 9–5pm per jurisdiction", after: "24/7, no exceptions" },
          { label: "Compliance", before: "Manual, blocks the operation", after: "Non-blocking by design" },
          { label: "Yield", before: "0–1% in corporate account", after: "5–8% in active Vault" },
        ],
        colBefore: "Current system",
        colAfter: "Soberana",
      },
      arquitectura: {
        title: "One architecture, three pillars",
        subtitle:
          "We did not build a product. We built infrastructure that others turn into products.",
        p1: "The distinction matters. A product solves one problem for one user. Infrastructure creates the conditions for thousands of actors to solve millions of problems.",
        p2: "The three pillars share a ledger, the same quotation engine, and the same intelligence layer. A bank implementing BaaS and a company using the operational platform are looking at the same state of the world from different angles.",
        pillars: [
          {
            icon: Layers,
            title: "API infrastructure",
            desc: "13+ rails: ACH, Wire, PIX, SEPA, SPEI, BRE-B and stablecoins on ETH, SOL, Base, Polygon, Tron. One integration, every financial language.",
          },
          {
            icon: Brain,
            title: "Operational platform",
            desc: "Zentinel (treasury agent), Workflow Composer (no-code flows), and Vault (yield on waiting capital). For CFOs without an engineering team.",
          },
          {
            icon: Building2,
            title: "Banking as a Service",
            desc: "Soberana Elements: KYC, automatic tax withholding, and global rails in any checkout — with the client's branding. Time to market: 6 weeks vs 18 months.",
          },
        ],
        rails: {
          title: "The Global Payment Network",
          labelFiat: "Fiat Rails",
          labelBlockchain: "Blockchain Rails",
          fiat: [
            { rail: "ACH", region: "United States" },
            { rail: "Wire", region: "Global" },
            { rail: "PIX", region: "Brazil" },
            { rail: "SEPA", region: "Europe" },
            { rail: "SPEI", region: "Mexico" },
            { rail: "SWIFT", region: "Global" },
          ],
          blockchain: [
            { chain: "Base", assets: "USDC" },
            { chain: "Ethereum", assets: "USDC, USDT, ETH" },
            { chain: "Solana", assets: "USDC, SOL" },
            { chain: "Polygon", assets: "USDC, USDT" },
          ],
        },
      },
      instrumentos: {
        title: "The instruments",
        subtitle: "Five ways to give capital back what it deserves.",
        p1: "Soberana's instruments are not roadmap features — they are operational capabilities processing real transactions today.",
        instruments: [
          {
            icon: Vault,
            name: "Vaults",
            desc: "Idle operational capital generating institutional yield. Automatic kill switches. Full real-time transparency.",
          },
          {
            icon: Bot,
            name: "Zentinel",
            desc: "24/7 treasury agent. Proposes actions with the full plan — fee, rate, settlement time — and waits for confirmation before executing.",
          },
          {
            icon: CreditCard,
            name: "Card Pro",
            desc: "Just-in-time payments: conversion at the exact millisecond of spend. Zero pre-funded capital sitting idle.",
          },
          {
            icon: Workflow,
            name: "Workflow Composer",
            desc: "International payroll, FX flows, accounting notifications — designed visually, executed without human intervention.",
          },
          {
            icon: Smartphone,
            name: "Soberana Elements",
            desc: "KYC, tax withholding, and global rails embedded in any product, with your own branding, via a copy-paste snippet.",
          },
        ],
        workflowTitle: "Workflow Composer Palette — 13 categories, 50+ nodes",
        workflowCategories: [
          { name: "Triggers", nodes: ["Webhook", "Scheduled", "Incoming Payment", "POS Sale"] },
          { name: "Checks", nodes: ["KYC/KYB", "Balance", "Screening", "Compliance"] },
          { name: "Move", nodes: ["PIX", "ACH", "SEPA", "Transfer"] },
          { name: "Change", nodes: ["FX Quote", "FX Execute", "On-ramp", "Off-ramp"] },
          { name: "Vaults", nodes: ["Deposit", "Redeem"] },
          { name: "Compliance", nodes: ["Policy Gate", "Limits", "Address Screening"] },
          { name: "Integrations", nodes: ["ERP", "Accounting", "Webhook", "SFTP"] },
          { name: "Logic", nodes: ["Branch", "Approval", "Notify"] },
        ],
      },
      horizonte: {
        title: "The technical horizon",
        subtitle:
          "We do not speculate about abstract possibilities. We extrapolate from primitives already in production.",
        p1: "Every point on Soberana's technical horizon has a concrete reference: code in production, published standards, institutional experiments with measurable results.",
        techs: [
          { icon: Wallet, name: "Account Abstraction", detail: "ERC-4337 in production since 2023. 2M+ active smart wallets." },
          { icon: DollarSign, name: "Programmable liquidity", detail: "Uniswap v4 hooks — pools with compliance gated at the protocol level." },
          { icon: FileCheck, name: "Sovereign identity", detail: "W3C Verifiable Credentials + eIDAS 2.0. Portable KYB, verified once." },
          { icon: Landmark, name: "RWA as collateral", detail: "BlackRock BUIDL and Ondo T-Bills — tokenized assets as JIT credit collateral." },
          { icon: Brain, name: "Episodic memory", detail: "Zentinel learns historical patterns to move from analysis to foresight." },
        ],
      },
      diseno: {
        title: "Design as principle",
        subtitle:
          "In fintech, aesthetics are not cosmetic. They are how trust becomes visible.",
        quote:
          "Every confusing pixel is a pixel that betrays the user's trust at the moment that trust matters most.",
        p1: "Banks build marble buildings not for function — for semiotics. Marble says: money is safe here, the institution has permanence, the decisions made inside are solid. Soberana's digital interface exists with the same principle.",
        p2: "We call our system 'confident minimalism': black and white by default, color reserved for status signals. When a number appears green on the Zentinel dashboard, the user knows something important is there. When everything is colorful, nothing is urgent.",
        principles: [
          { icon: Globe, name: "Color", desc: "B&W as base. Color only for status: success, warning, error. Never decorative." },
          { icon: FileCheck, name: "Typography", desc: "Monospace for financial data. Tabular figures, right-aligned. Hierarchy without iconography." },
          { icon: Zap, name: "Space", desc: "Generous by conviction. The payment confirmation screen shows only what matters at that moment." },
          { icon: Clock, name: "Motion", desc: "150–200ms. ease-out. Only for state changes. Never celebration, always information." },
        ],
      },
      audiencias: {
        title: "Who we speak to",
        subtitle: "Three actors. The same system. Different conversations.",
        p1: "Soberana does not have a single customer. All three arrive with a different problem and the same realization: the financial system they have is not the one they deserve.",
        colBefore: "The pain",
        colAfter: "The answer",
        audiences: [
          {
            icon: Landmark,
            name: "Banks",
            pains: [
              { before: "Legacy infrastructure that does not scale", after: "Modern API + Workflow Builder for orchestration" },
              { before: "Rising compliance costs", after: "Integrated KYC/KYB, compliance in workflows" },
              { before: "Inefficient treasury", after: "Vaults with yield + 24/7 Zentinel" },
            ],
          },
          {
            icon: Zap,
            name: "Fintechs",
            pains: [
              { before: "Building payment rails from scratch", after: "13+ integrated rails, one contract" },
              { before: "Time-to-market in months", after: "White-label with branding, sandbox on day one" },
              { before: "Complex multi-currency support", after: "Quotes engine with indicative and locked rates" },
            ],
          },
          {
            icon: DollarSign,
            name: "Corporates",
            pains: [
              { before: "Slow and expensive international payments", after: "Cross-border with < 5 minute settlement" },
              { before: "Manual beneficiary management", after: "CRUD with jurisdiction-level validation" },
              { before: "No treasury visibility", after: "Conversational dashboard with real-time FX" },
            ],
          },
        ],
      },
      futuro: {
        title: "2030",
        subtitle:
          "A company in Bogotá earns yield, pays in Lagos, and settles in Tokyo. Without touching a correspondent bank.",
        p1: "By 2030, the correspondent banking corridor will have lost its central role — not because it disappears, but because it will be like the steam train next to the airplane: still there, but no one with an alternative chooses it.",
        p2: "An exporter in Bogotá receives a payment from Tokyo. It arrives in USDC in 3 seconds. The Workflow Composer executes automatically: 20% to COP for payroll, the rest in the Vault until the exchange rate crosses the target. When it is time to pay in Lagos, Zentinel settles in naira in under 5 minutes. The treasurer receives a notification — they made no intermediate decisions.",
        p3: "Onboarding at a new institution takes hours. The Verifiable Credential is accepted across the ecosystem. Working capital credit comes from whoever has been processing your payments for three years and knows you always pay suppliers five days early.",
        flow: [
          { label: "Tokyo → USDC" },
          { label: "Auto workflow" },
          { label: "20% → COP payroll" },
          { label: "Vault earns" },
        ],
        traccion: [
          { number: "45+", label: "countries with coverage" },
          { number: "1M+", label: "transactions processed" },
          { number: "$2B+", label: "volume mobilized" },
          { number: "13+", label: "payment rails" },
          { number: "< 5min", label: "average settlement" },
          { number: "50+", label: "currencies supported" },
          { number: "5", label: "operational continents" },
        ],
        roadmap: {
          labelProd: "In Production",
          labelDev: "In Development",
          labelFuture: "Future",
          production: [
            "Conversational dashboard",
            "Receive (on-ramp)",
            "Send (off-ramp)",
            "KYC via Persona",
            "Zentinel chat",
            "Operational backoffice",
            "Interactive API docs",
          ],
          development: [
            "Vaults live dashboard",
            "Workflow Builder",
            "Soberana Elements",
            "Card Pro",
            "AI Builder",
            "Sales Helper toolkit",
          ],
          future: [
            "Workflow execution engine",
            "Zentinel with operational autonomy",
            "Multi-strategy Vaults",
            "POS integration",
            "Agent Teams",
            "Mobile app",
          ],
        },
        closing: "Soberana is not what you build on top of the infrastructure.",
        closingTagline: "It is the infrastructure. Every border. One click.",
      },
    },
  },
} as const;

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
  number: string;
  label: string;
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <p className="font-mono tabular-nums text-3xl font-bold text-foreground">{number}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

interface FlowNodeProps {
  nodes: readonly { label: string }[];
}

function FlowNodes({ nodes }: FlowNodeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 my-6">
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm font-medium text-foreground">
            {node.label}
          </div>
          {i < nodes.length - 1 && (
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const navigate = useNavigate();
  const { language } = useDocsLanguageStore();
  const c = language === "en" ? CONTENT.en : CONTENT.es;
  const s = c.sections;

  return (
    <div className="space-y-16 max-w-3xl">

      <div className="-mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="-ml-3 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          ← {language === "en" ? "Back to Soberana" : "Volver a Soberana"}
        </Button>
      </div>

      {/* Hero */}
      <header className="space-y-4 pb-8 border-b border-border">
        <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
          {c.hero.eyebrow}
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight">
          {c.hero.title}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          {c.hero.subtitle}
        </p>
      </header>

      {/* 01 — El sistema está roto */}
      <DocSection
        title={s.problema.title}
        sectionId="el-problema"
        subtitle={s.problema.subtitle}
        level={2}
        gradientTitle
      >
        <p className="text-base text-foreground leading-relaxed">{s.problema.p1}</p>
        <p className="text-base text-foreground leading-relaxed mt-4">{s.problema.p2}</p>

        {/* Three enemies — plain cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          {s.problema.enemies.map((enemy) => (
            <div key={enemy.label} className="bg-card rounded-xl p-5 border border-border">
              <Badge variant="secondary" className="rounded-md mb-3">{enemy.label}</Badge>
              <p className="text-sm text-muted-foreground leading-snug">{enemy.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-base text-foreground leading-relaxed">{s.problema.p3}</p>

        {/* Stats: two plain + one brand-moment (market opportunity) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          <StatCard number={s.problema.stat1.number} label={s.problema.stat1.label} />
          <StatCard number={s.problema.stat2.number} label={s.problema.stat2.label} />
          {/* Brand moment — full gradient bg for the market opportunity number */}
          <div className="bg-brand-gradient rounded-xl p-6">
            <p className="font-mono tabular-nums text-3xl font-bold text-white">
              {s.problema.mercado.number}
            </p>
            <p className="text-sm text-white/80 mt-1">{s.problema.mercado.label}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground -mt-4 mb-8">{s.problema.mercado.source}</p>

        <blockquote className="border-l-4 border-primary pl-6 py-2 my-8">
          <p className="text-xl font-light italic text-foreground">{s.problema.quote}</p>
        </blockquote>
      </DocSection>

      {/* 02 — El dinero no descansa */}
      <DocSection
        title={s.promesa.title}
        sectionId="la-promesa"
        subtitle={s.promesa.subtitle}
        level={2}
        gradientTitle
      >
        <p className="text-base text-foreground leading-relaxed">{s.promesa.p1}</p>

        <div className="grid grid-cols-2 gap-4 my-8">
          <StatCard number={s.promesa.stat1.number} label={s.promesa.stat1.label} />
          <StatCard number={s.promesa.stat2.number} label={s.promesa.stat2.label} />
        </div>

        <p className="text-base text-foreground leading-relaxed">{s.promesa.p2}</p>
        <p className="text-base text-foreground leading-relaxed mt-4">{s.promesa.p3}</p>
        <FlowNodes nodes={s.promesa.flow} />
      </DocSection>

      {/* 03 — Sobre la soberanía */}
      <DocSection
        title={s.soberania.title}
        sectionId="soberania"
        subtitle={s.soberania.subtitle}
        level={2}
        gradientTitle
      >
        <p className="text-base text-foreground leading-relaxed">{s.soberania.p1}</p>
        <p className="text-base text-foreground leading-relaxed mt-4">{s.soberania.p2}</p>
        <p className="text-base text-foreground leading-relaxed mt-4">{s.soberania.p3}</p>

        {/* Comparison table — plain */}
        <div className="mt-8 rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-3 bg-muted px-4 py-3 text-sm font-semibold text-foreground">
            <span></span>
            <span className="text-muted-foreground">{s.soberania.colBefore}</span>
            <span>{s.soberania.colAfter}</span>
          </div>
          <Separator />
          {s.soberania.compareRows.map((row, i) => (
            <div key={i}>
              <div className="grid grid-cols-3 px-4 py-3 text-sm items-start gap-2">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="text-muted-foreground">{row.before}</span>
                <span className="text-foreground">{row.after}</span>
              </div>
              {i < s.soberania.compareRows.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </DocSection>

      {/* 04 — Una arquitectura, tres pilares */}
      <DocSection
        title={s.arquitectura.title}
        sectionId="la-arquitectura"
        subtitle={s.arquitectura.subtitle}
        level={2}
      >
        <p className="text-base text-foreground leading-relaxed">{s.arquitectura.p1}</p>
        <p className="text-base text-foreground leading-relaxed mt-4">{s.arquitectura.p2}</p>

        {/* Pillar cards — gradient-thin border (mask trick, correct border-only rendering) */}
        <div className="grid grid-cols-1 gap-4 mt-8">
          {s.arquitectura.pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} variant="gradient-thin">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="mt-0.5 shrink-0">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{pillar.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment rails — plain */}
        <div className="mt-10">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            {s.arquitectura.rails.title}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-5 border border-border">
              <p className="text-xs font-mono uppercase tracking-wider text-foreground mb-3">
                {s.arquitectura.rails.labelFiat}
              </p>
              <ul className="space-y-2">
                {s.arquitectura.rails.fiat.map((r) => (
                  <li key={r.rail} className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{r.rail}</span>
                    <span className="text-muted-foreground">{r.region}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <p className="text-xs font-mono uppercase tracking-wider text-foreground mb-3">
                {s.arquitectura.rails.labelBlockchain}
              </p>
              <ul className="space-y-2">
                {s.arquitectura.rails.blockchain.map((r) => (
                  <li key={r.chain} className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{r.chain}</span>
                    <span className="text-muted-foreground font-mono text-xs">{r.assets}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DocSection>

      {/* 05 — Los instrumentos */}
      <DocSection
        title={s.instrumentos.title}
        sectionId="los-instrumentos"
        subtitle={s.instrumentos.subtitle}
        level={2}
        gradientTitle
      >
        <p className="text-base text-foreground leading-relaxed">{s.instrumentos.p1}</p>

        {/* Instrument cards — gradient-thin border (product showcase) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {s.instrumentos.instruments.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.name} variant="gradient-thin">
                <CardContent className="p-5 flex gap-3 items-start">
                  <div className="mt-0.5 shrink-0">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{item.name}</p>
                    <p className="text-sm text-muted-foreground leading-snug">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Workflow palette — plain small cells */}
        <div className="mt-10">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            {s.instrumentos.workflowTitle}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {s.instrumentos.workflowCategories.map((cat) => (
              <div key={cat.name} className="bg-muted/50 rounded-lg p-3 border border-border">
                <Badge variant="secondary" className="rounded-md text-xs mb-2">{cat.name}</Badge>
                <ul className="space-y-0.5">
                  {cat.nodes.map((node) => (
                    <li key={node} className="text-xs text-muted-foreground">{node}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </DocSection>

      {/* 06 — El horizonte técnico */}
      <DocSection
        title={s.horizonte.title}
        sectionId="el-horizonte-tecnico"
        subtitle={s.horizonte.subtitle}
        level={2}
      >
        <p className="text-base text-foreground leading-relaxed">{s.horizonte.p1}</p>

        {/* Tech horizon — plain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {s.horizonte.techs.map((tech) => {
            const Icon = tech.icon;
            return (
              <div key={tech.name} className="bg-card rounded-xl p-5 border border-border flex gap-3 items-start">
                <div className="mt-0.5 shrink-0">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1">{tech.name}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{tech.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DocSection>

      {/* 07 — El diseño como principio */}
      <DocSection
        title={s.diseno.title}
        sectionId="el-diseno"
        subtitle={s.diseno.subtitle}
        level={2}
        gradientTitle
      >
        <p className="text-base text-foreground leading-relaxed">{s.diseno.p1}</p>
        <p className="text-base text-foreground leading-relaxed mt-4">{s.diseno.p2}</p>

        {/* Design principles — plain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
          {s.diseno.principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div key={principle.name} className="bg-card rounded-xl p-5 border border-border flex gap-3 items-start">
                <div className="mt-0.5 shrink-0">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1">{principle.name}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{principle.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <blockquote className="border-l-4 border-primary pl-6 py-2 my-8">
          <p className="text-xl font-light italic text-foreground">{s.diseno.quote}</p>
        </blockquote>
      </DocSection>

      {/* 08 — A quién hablamos */}
      <DocSection
        title={s.audiencias.title}
        sectionId="audiencias"
        subtitle={s.audiencias.subtitle}
        level={2}
      >
        <p className="text-base text-foreground leading-relaxed">{s.audiencias.p1}</p>

        {/* Audience cards — plain with 3-row pain/answer structure */}
        <div className="grid grid-cols-1 gap-4 mt-8">
          {s.audiencias.audiences.map((audience) => {
            const Icon = audience.icon;
            return (
              <div key={audience.name} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5 text-foreground" />
                  <p className="font-semibold text-foreground">{audience.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {s.audiencias.colBefore}
                  </p>
                  <p className="text-xs font-mono uppercase tracking-wider text-foreground">
                    {s.audiencias.colAfter}
                  </p>
                </div>
                <div className="space-y-0">
                  {audience.pains.map((pain, i) => (
                    <div key={i} className="grid grid-cols-2 gap-4 text-sm py-2.5 border-t border-border/50">
                      <p className="text-muted-foreground leading-snug">{pain.before}</p>
                      <p className="text-foreground leading-snug">{pain.after}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DocSection>

      {/* 09 — 2030 */}
      <DocSection
        title={s.futuro.title}
        sectionId="el-futuro"
        subtitle={s.futuro.subtitle}
        level={2}
        gradientTitle
      >
        {/* Traction stats — plain large numbers, data speaks alone */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {s.futuro.traccion.slice(0, 4).map((stat) => (
            <StatCard key={stat.label} number={stat.number} label={stat.label} />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {s.futuro.traccion.slice(4).map((stat) => (
            <StatCard key={stat.label} number={stat.number} label={stat.label} />
          ))}
        </div>

        <p className="text-base text-foreground leading-relaxed">{s.futuro.p1}</p>
        <p className="text-base text-foreground leading-relaxed mt-4">{s.futuro.p2}</p>
        <FlowNodes nodes={s.futuro.flow} />
        <p className="text-base text-foreground leading-relaxed">{s.futuro.p3}</p>

        {/* Roadmap — plain three columns with status colors */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-xs font-mono uppercase tracking-wider text-success mb-3">
              {s.futuro.roadmap.labelProd}
            </p>
            <ul className="space-y-1.5">
              {s.futuro.roadmap.production.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-success mt-0.5 shrink-0 select-none">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-xl p-5 border border-primary/20">
            <p className="text-xs font-mono uppercase tracking-wider text-warning mb-3">
              {s.futuro.roadmap.labelDev}
            </p>
            <ul className="space-y-1.5">
              {s.futuro.roadmap.development.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-warning mt-0.5 shrink-0 select-none">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
              {s.futuro.roadmap.labelFuture}
            </p>
            <ul className="space-y-1.5">
              {s.futuro.roadmap.future.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 select-none">◦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Closing tagline — intocable */}
        <Separator className="my-10" />
        <div className="space-y-2">
          <p className="text-xl text-muted-foreground leading-relaxed">{s.futuro.closing}</p>
          <p className="text-3xl font-bold tracking-tight text-gradient-loopay leading-tight">
            {s.futuro.closingTagline}
          </p>
        </div>
      </DocSection>

    </div>
  );
}
