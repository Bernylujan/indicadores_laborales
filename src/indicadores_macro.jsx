// ════════════════════════════════════════════════════════════════════════════
//  DASHBOARD DE INDICADORES LABORALES — MICHOACÁN
//  Secretaría de Desarrollo Económico · Subsecretaría de Trabajo y Previsión Social
// ────────────────────────────────────────────────────────────────────────────
//  ARQUITECTURA DEL ARCHIVO  (leer antes de editar)
//
//  BLOQUE 1 · HOOK RESPONSIVO      línea ~9
//    └─ useWindowWidth()  →  detecta si la pantalla es mobile (≤ 430 px)
//
//  BLOQUE 2 · CONFIGURACIÓN GLOBAL  línea ~22
//    └─ MX       →  ⚠️  PALETA DE COLORES  (editar aquí para cambiar toda la app)
//    └─ FONT     →  Fuente tipográfica global
//    └─ NAV      →  Tabs principales (id, label, sub)
//
//  BLOQUE 3 · DATOS                 línea ~39
//    ├─ ENOE     →  Series trimestrales 2016–2025  (formato de período: "I 16", "IV 25")
//    │   ENOE_PEA, ENOE_OCUP, ENOE_DESOC_ABS, ENOE_PART, ENOE_DESOC
//    │   ENOE_S32_TOTAL, ENOE_S32_SUBSECTORES
//    │   ENOE_S41_TOTAL, ENOE_S41_SUBSECTORES, ENOE_S41_GRANDES
//    ├─ IMSS     →  Series mensuales 2016–2026  (formato de período: "Ene 16", "Ene 26")
//    │   IMSS_PT_TOTAL, IMSS_PT_PERM, IMSS_PT_EV
//    │   IMSS_PT_PERM_CAMPO, IMSS_PT_PERM_URB, IMSS_PT_EV_CAMPO, IMSS_PT_EV_URB
//    │   IMSS_SECTORES_ENE26, IMSS_GRANDES_ENE26
//    └─ SECTORES →  Datos derivados para pie chart (SEC_E, SEC_I)
//
//  BLOQUE 4 · UTILIDADES            línea ~1000
//    └─ mergeByPeriod, fmtM, fmtN, avg, xTickYear, axTick, legFmt
//    └─ fmtPeriod    →  convierte "I 25" → "Trimestre 1 · 2025"
//    └─ BaseTooltip  →  ⚠️  TOOLTIP COMPARTIDO de todas las gráficas
//
//  BLOQUE 5 · COMPONENTES BASE      línea ~1080
//    └─ AnimNum, KpiCard, Pills, Section, Card, PieLabel
//
//  BLOQUE 6 · GRÁFICAS ENOE         línea ~1130
//    └─ GrafPEAOcupados  →  Línea PEA + Población Ocupada
//    └─ GrafTasas        →  Tasas de Participación y Desocupación (doble eje)
//    └─ GrafSubsectores  →  ⚠️  BARRAS HORIZONTALES ENOE (ver ETIQ y ETIQ_MOB)
//
//  BLOQUE 7 · TAB ENOE              línea ~1390
//    └─ TabENOE  →  KPIs + GrafPEAOcupados / GrafTasas + GrafSubsectores
//
//  BLOQUE 8 · TAB IMSS              línea ~1420
//    └─ TabIMSS  →  KPIs + BarChart Anual + ComposedChart Perm/Ev + Zonas
//
//  BLOQUE 9 · TAB SECTORES          línea ~1650
//    └─ TabSectores  →  PieChart grandes sectores + ⚠️  BARRAS HORIZONTALES ENOE/IMSS
//
//  BLOQUE 10 · APP PRINCIPAL        línea ~1820
//    └─ App  →  Header + Tabs de navegación + enrutamiento
//
//  ── GUÍA DE MODIFICACIONES FRECUENTES ───────────────────────────────────
//  Cambiar colores          →  objeto MX  (bloque 2)
//  Actualizar datos ENOE    →  arrays ENOE_*  (bloque 3)
//  Actualizar datos IMSS    →  arrays IMSS_*  (bloque 3)
//  Cambiar tooltip          →  BaseTooltip  (bloque 4)
//  Cambiar nombres sectores →  ETIQ / ETIQ_MOB / ETIQ_IMSS  (bloques 6 y 9)
//  Cambiar alto de gráficas →  chartH / height en cada componente
//  Cambiar período en header→  "IV Trim. 2025" en App  (bloque 10)
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
  ComposedChart,
  Area,
} from "recharts";

// ─── HOOK RESPONSIVO ─────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 390,
  );
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return width;
}

// ─── BLOQUE 2 · CONFIGURACIÓN GLOBAL ───────────────────────────────────────────
// ⚠️  PALETA DE COLORES  —  modifica aquí para cambiar colores en toda la app
const MX = {
  vino: "#6B1737",
  vinoDark: "#4A0F26",
  vinoMid: "#8C2249",
  rosa: "#C8427A",
  rosaLt: "#E8A0BC",
  crema: "#F9F0F4",
  grayLt: "#F5F7FA",
  grayMid: "#8896A5",
  grayDark: "#2E3A47",
  white: "#FFFFFF",
  green: "#1A7A4A",
  border: "#E8DDE3",
  neutral: "#B07080",
};
// ⚠️  FUENTE GLOBAL  —  cambia aquí para aplicar otra tipografía
const FONT = "Tahoma, Geneva, sans-serif";

// ⚠️  TABS DE NAVEGACIÓN  —  agrega o renombra secciones aquí
// Estructura: { id: string, label: string, sub: string }
const NAV = [
  { id: "enoe", label: "Mercado Laboral", sub: "ENOE · INEGI" },
  { id: "imss", label: "Empleo Formal", sub: "IMSS CUBOS" },
  { id: "sectores", label: "Sectores", sub: "ENOE + IMSS" },
];

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 3 · DATOS — ENOE REALES · Michoacán 2016–2025
// ────────────────────────────────────────────────────────────────────────────
//  Fuente: ENOE (INEGI) · data.inegi.org.mx
//  Frecuencia: trimestral  |  Período: "I 16" = primer trimestre 2016
//  ⚠️  Para actualizar: reemplaza los arrays completos con los nuevos valores.
//  Nota: II 2020 no existe (fue sustituido por ETOE durante la pandemia).
// ════════════════════════════════════════════════════════════════════════════

// HOJA 1 — PEA (personas)
const ENOE_PEA = [
  { p: "I 16", pea: 1926170 },
  { p: "II 16", pea: 1954099 },
  { p: "III 16", pea: 1964710 },
  { p: "IV 16", pea: 1941072 },
  { p: "I 17", pea: 1919012 },
  { p: "II 17", pea: 1920656 },
  { p: "III 17", pea: 1926302 },
  { p: "IV 17", pea: 1933242 },
  { p: "I 18", pea: 1952846 },
  { p: "II 18", pea: 2005951 },
  { p: "III 18", pea: 2021150 },
  { p: "IV 18", pea: 2007279 },
  { p: "I 19", pea: 2081647 },
  { p: "II 19", pea: 2105005 },
  { p: "III 19", pea: 2101448 },
  { p: "IV 19", pea: 2100537 },
  { p: "I 20", pea: 2131347 },
  { p: "III 20", pea: 1952809 },
  { p: "IV 20", pea: 1973085 },
  { p: "I 21", pea: 1989700 },
  { p: "II 21", pea: 2041844 },
  { p: "III 21", pea: 2173381 },
  { p: "IV 21", pea: 2165988 },
  { p: "I 22", pea: 2203754 },
  { p: "II 22", pea: 2236441 },
  { p: "III 22", pea: 2251196 },
  { p: "IV 22", pea: 2246319 },
  { p: "I 23", pea: 2189342 },
  { p: "II 23", pea: 2220568 },
  { p: "III 23", pea: 2275618 },
  { p: "IV 23", pea: 2273025 },
  { p: "I 24", pea: 2307150 },
  { p: "II 24", pea: 2288048 },
  { p: "III 24", pea: 2241689 },
  { p: "IV 24", pea: 2251965 },
  { p: "I 25", pea: 2257524 },
  { p: "II 25", pea: 2295756 },
  { p: "III 25", pea: 2271570 },
  { p: "IV 25", pea: 2259793 },
];

// HOJA 2 — Población Ocupada total S32 (personas)
const ENOE_S32_TOTAL = [
  { p: "I 16", total: 1871618 },
  { p: "II 16", total: 1894286 },
  { p: "III 16", total: 1897251 },
  { p: "IV 16", total: 1887460 },
  { p: "I 17", total: 1857078 },
  { p: "II 17", total: 1861157 },
  { p: "III 17", total: 1870102 },
  { p: "IV 17", total: 1888916 },
  { p: "I 18", total: 1913251 },
  { p: "II 18", total: 1964940 },
  { p: "III 18", total: 1968570 },
  { p: "IV 18", total: 1954763 },
  { p: "I 19", total: 2030297 },
  { p: "II 19", total: 2041431 },
  { p: "III 19", total: 2035944 },
  { p: "IV 19", total: 2041562 },
  { p: "I 20", total: 2078586 },
  { p: "III 20", total: 1901277 },
  { p: "IV 20", total: 1926075 },
  { p: "I 21", total: 1938867 },
  { p: "II 21", total: 1995411 },
  { p: "III 21", total: 2121992 },
  { p: "IV 21", total: 2109740 },
  { p: "I 22", total: 2167147 },
  { p: "II 22", total: 2196269 },
  { p: "III 22", total: 2202738 },
  { p: "IV 22", total: 2207642 },
  { p: "I 23", total: 2151774 },
  { p: "II 23", total: 2171904 },
  { p: "III 23", total: 2226020 },
  { p: "IV 23", total: 2218521 },
  { p: "I 24", total: 2265763 },
  { p: "II 24", total: 2241862 },
  { p: "III 24", total: 2185244 },
  { p: "IV 24", total: 2214780 },
  { p: "I 25", total: 2221772 },
  { p: "II 25", total: 2255591 },
  { p: "III 25", total: 2219812 },
  { p: "IV 25", total: 2219220 },
];

// HOJA 1 — Población Ocupada (para barras apiladas)
const ENOE_OCUP = [
  { p: "I 16", ocup: 1874108 },
  { p: "II 16", ocup: 1899919 },
  { p: "III 16", ocup: 1903236 },
  { p: "IV 16", ocup: 1893806 },
  { p: "I 17", ocup: 1863003 },
  { p: "II 17", ocup: 1867997 },
  { p: "III 17", ocup: 1876353 },
  { p: "IV 17", ocup: 1891186 },
  { p: "I 18", ocup: 1914463 },
  { p: "II 18", ocup: 1966229 },
  { p: "III 18", ocup: 1972183 },
  { p: "IV 18", ocup: 1957250 },
  { p: "I 19", ocup: 2033264 },
  { p: "II 19", ocup: 2043399 },
  { p: "III 19", ocup: 2039927 },
  { p: "IV 19", ocup: 2043616 },
  { p: "I 20", ocup: 2081384 },
  { p: "III 20", ocup: 1902879 },
  { p: "IV 20", ocup: 1927870 },
  { p: "I 21", ocup: 1939107 },
  { p: "II 21", ocup: 2001324 },
  { p: "III 21", ocup: 2125618 },
  { p: "IV 21", ocup: 2110933 },
  { p: "I 22", ocup: 2168027 },
  { p: "II 22", ocup: 2197848 },
  { p: "III 22", ocup: 2209525 },
  { p: "IV 22", ocup: 2208839 },
  { p: "I 23", ocup: 2152972 },
  { p: "II 23", ocup: 2176263 },
  { p: "III 23", ocup: 2230897 },
  { p: "IV 23", ocup: 2225476 },
  { p: "I 24", ocup: 2267530 },
  { p: "II 24", ocup: 2248664 },
  { p: "III 24", ocup: 2191694 },
  { p: "IV 24", ocup: 2219125 },
  { p: "I 25", ocup: 2231080 },
  { p: "II 25", ocup: 2258881 },
  { p: "III 25", ocup: 2227830 },
  { p: "IV 25", ocup: 2227842 },
];

// HOJA 1 — Desocupados absolutos
const ENOE_DESOC_ABS = [
  { p: "I 16", desoc_abs: 52062 },
  { p: "II 16", desoc_abs: 54180 },
  { p: "III 16", desoc_abs: 61474 },
  { p: "IV 16", desoc_abs: 47266 },
  { p: "I 17", desoc_abs: 56009 },
  { p: "II 17", desoc_abs: 52659 },
  { p: "III 17", desoc_abs: 49949 },
  { p: "IV 17", desoc_abs: 42056 },
  { p: "I 18", desoc_abs: 38383 },
  { p: "II 18", desoc_abs: 39722 },
  { p: "III 18", desoc_abs: 48967 },
  { p: "IV 18", desoc_abs: 50029 },
  { p: "I 19", desoc_abs: 48383 },
  { p: "II 19", desoc_abs: 61606 },
  { p: "III 19", desoc_abs: 61521 },
  { p: "IV 19", desoc_abs: 56921 },
  { p: "I 20", desoc_abs: 49963 },
  { p: "III 20", desoc_abs: 49930 },
  { p: "IV 20", desoc_abs: 45215 },
  { p: "I 21", desoc_abs: 50593 },
  { p: "II 21", desoc_abs: 40520 },
  { p: "III 21", desoc_abs: 47763 },
  { p: "IV 21", desoc_abs: 55055 },
  { p: "I 22", desoc_abs: 35727 },
  { p: "II 22", desoc_abs: 38593 },
  { p: "III 22", desoc_abs: 41671 },
  { p: "IV 22", desoc_abs: 37480 },
  { p: "I 23", desoc_abs: 36370 },
  { p: "II 23", desoc_abs: 44305 },
  { p: "III 23", desoc_abs: 44721 },
  { p: "IV 23", desoc_abs: 47549 },
  { p: "I 24", desoc_abs: 39620 },
  { p: "II 24", desoc_abs: 39384 },
  { p: "III 24", desoc_abs: 49995 },
  { p: "IV 24", desoc_abs: 32840 },
  { p: "I 25", desoc_abs: 26444 },
  { p: "II 25", desoc_abs: 36875 },
  { p: "III 25", desoc_abs: 43740 },
  { p: "IV 25", desoc_abs: 31951 },
];

// HOJA 1 — Tasa de Participación (%)
const ENOE_PART = [
  { p: "I 16", part: 59.39 },
  { p: "II 16", part: 60.12 },
  { p: "III 16", part: 60.61 },
  { p: "IV 16", part: 60.17 },
  { p: "I 17", part: 59.35 },
  { p: "II 17", part: 58.8 },
  { p: "III 17", part: 58.82 },
  { p: "IV 17", part: 59.27 },
  { p: "I 18", part: 59.64 },
  { p: "II 18", part: 60.52 },
  { p: "III 18", part: 59.65 },
  { p: "IV 18", part: 59.08 },
  { p: "I 19", part: 60.44 },
  { p: "II 19", part: 60.65 },
  { p: "III 19", part: 60.24 },
  { p: "IV 19", part: 59.96 },
  { p: "I 20", part: 61.0 },
  { p: "III 20", part: 56.11 },
  { p: "IV 20", part: 56.7 },
  { p: "I 21", part: 56.32 },
  { p: "II 21", part: 57.04 },
  { p: "III 21", part: 59.62 },
  { p: "IV 21", part: 59.09 },
  { p: "I 22", part: 59.39 },
  { p: "II 22", part: 61.12 },
  { p: "III 22", part: 61.68 },
  { p: "IV 22", part: 61.51 },
  { p: "I 23", part: 59.94 },
  { p: "II 23", part: 60.74 },
  { p: "III 23", part: 60.38 },
  { p: "IV 23", part: 60.94 },
  { p: "I 24", part: 61.76 },
  { p: "II 24", part: 61.61 },
  { p: "III 24", part: 60.12 },
  { p: "IV 24", part: 60.2 },
  { p: "I 25", part: 60.51 },
  { p: "II 25", part: 60.65 },
  { p: "III 25", part: 60.17 },
  { p: "IV 25", part: 60.21 },
];

// HOJA 1 — Tasa de Desocupación (%)
const ENOE_DESOC = [
  { p: "I 16", desoc: 2.7 },
  { p: "II 16", desoc: 2.77 },
  { p: "III 16", desoc: 3.13 },
  { p: "IV 16", desoc: 2.44 },
  { p: "I 17", desoc: 2.92 },
  { p: "II 17", desoc: 2.74 },
  { p: "III 17", desoc: 2.59 },
  { p: "IV 17", desoc: 2.18 },
  { p: "I 18", desoc: 1.97 },
  { p: "II 18", desoc: 1.98 },
  { p: "III 18", desoc: 2.42 },
  { p: "IV 18", desoc: 2.49 },
  { p: "I 19", desoc: 2.32 },
  { p: "II 19", desoc: 2.93 },
  { p: "III 19", desoc: 2.93 },
  { p: "IV 19", desoc: 2.71 },
  { p: "I 20", desoc: 2.34 },
  { p: "III 20", desoc: 2.56 },
  { p: "IV 20", desoc: 2.29 },
  { p: "I 21", desoc: 2.54 },
  { p: "II 21", desoc: 1.98 },
  { p: "III 21", desoc: 2.2 },
  { p: "IV 21", desoc: 2.54 },
  { p: "I 22", desoc: 1.62 },
  { p: "II 22", desoc: 1.73 },
  { p: "III 22", desoc: 1.85 },
  { p: "IV 22", desoc: 1.67 },
  { p: "I 23", desoc: 1.66 },
  { p: "II 23", desoc: 2.0 },
  { p: "III 23", desoc: 1.97 },
  { p: "IV 23", desoc: 2.09 },
  { p: "I 24", desoc: 1.72 },
  { p: "II 24", desoc: 1.72 },
  { p: "III 24", desoc: 2.23 },
  { p: "IV 24", desoc: 1.46 },
  { p: "I 25", desoc: 1.17 },
  { p: "II 25", desoc: 1.61 },
  { p: "III 25", desoc: 1.93 },
  { p: "IV 25", desoc: 1.41 },
];

// HOJA 2 — Subsectores (Ocup. Total) — REALES del archivo
const ENOE_S32_SUBSECTORES = [
  {
    p: "I 16",
    agric: 426977,
    ind_ext: 9638,
    manufactura: 237075,
    construccion: 121818,
    comercio: 378849,
    restaurantes: 139780,
    transportes: 67545,
    serv_prof: 75420,
    serv_soc: 157130,
    serv_div: 191181,
    gobierno: 66205,
  },
  {
    p: "II 16",
    agric: 464165,
    ind_ext: 10427,
    manufactura: 235382,
    construccion: 141025,
    comercio: 394544,
    restaurantes: 139391,
    transportes: 68728,
    serv_prof: 69358,
    serv_soc: 134937,
    serv_div: 176278,
    gobierno: 60051,
  },
  {
    p: "III 16",
    agric: 441705,
    ind_ext: 8603,
    manufactura: 222569,
    construccion: 141216,
    comercio: 398843,
    restaurantes: 133599,
    transportes: 66561,
    serv_prof: 81240,
    serv_soc: 139384,
    serv_div: 195836,
    gobierno: 67695,
  },
  {
    p: "IV 16",
    agric: 437830,
    ind_ext: 9510,
    manufactura: 222929,
    construccion: 149989,
    comercio: 397123,
    restaurantes: 132157,
    transportes: 66612,
    serv_prof: 71397,
    serv_soc: 136717,
    serv_div: 194760,
    gobierno: 68436,
  },
  {
    p: "I 17",
    agric: 414737,
    ind_ext: 5226,
    manufactura: 197232,
    construccion: 143233,
    comercio: 390001,
    restaurantes: 143062,
    transportes: 65629,
    serv_prof: 73089,
    serv_soc: 151683,
    serv_div: 203524,
    gobierno: 69662,
  },
  {
    p: "II 17",
    agric: 472331,
    ind_ext: 5766,
    manufactura: 203739,
    construccion: 138656,
    comercio: 358755,
    restaurantes: 142227,
    transportes: 59748,
    serv_prof: 68996,
    serv_soc: 150571,
    serv_div: 200718,
    gobierno: 59650,
  },
  {
    p: "III 17",
    agric: 475514,
    ind_ext: 2881,
    manufactura: 193403,
    construccion: 163311,
    comercio: 366347,
    restaurantes: 142093,
    transportes: 48458,
    serv_prof: 72837,
    serv_soc: 160209,
    serv_div: 184530,
    gobierno: 60519,
  },
  {
    p: "IV 17",
    agric: 484203,
    ind_ext: 4584,
    manufactura: 218884,
    construccion: 151501,
    comercio: 362419,
    restaurantes: 128607,
    transportes: 56202,
    serv_prof: 69504,
    serv_soc: 164482,
    serv_div: 184430,
    gobierno: 64100,
  },
  {
    p: "I 18",
    agric: 473120,
    ind_ext: 6625,
    manufactura: 212124,
    construccion: 157249,
    comercio: 382760,
    restaurantes: 144666,
    transportes: 63513,
    serv_prof: 74573,
    serv_soc: 156608,
    serv_div: 176628,
    gobierno: 65385,
  },
  {
    p: "II 18",
    agric: 491014,
    ind_ext: 6979,
    manufactura: 223493,
    construccion: 167147,
    comercio: 403724,
    restaurantes: 120713,
    transportes: 70799,
    serv_prof: 75141,
    serv_soc: 159123,
    serv_div: 181596,
    gobierno: 65211,
  },
  {
    p: "III 18",
    agric: 469157,
    ind_ext: 5544,
    manufactura: 202228,
    construccion: 184219,
    comercio: 395137,
    restaurantes: 134964,
    transportes: 69223,
    serv_prof: 82829,
    serv_soc: 166605,
    serv_div: 190040,
    gobierno: 68624,
  },
  {
    p: "IV 18",
    agric: 454011,
    ind_ext: 4008,
    manufactura: 186732,
    construccion: 165898,
    comercio: 425279,
    restaurantes: 145988,
    transportes: 67002,
    serv_prof: 75196,
    serv_soc: 156956,
    serv_div: 200259,
    gobierno: 73434,
  },
  {
    p: "I 19",
    agric: 481000,
    ind_ext: 4900,
    manufactura: 210943,
    construccion: 163862,
    comercio: 447138,
    restaurantes: 151526,
    transportes: 68574,
    serv_prof: 77734,
    serv_soc: 152808,
    serv_div: 206416,
    gobierno: 65396,
  },
  {
    p: "II 19",
    agric: 479660,
    ind_ext: 6464,
    manufactura: 258304,
    construccion: 166969,
    comercio: 439392,
    restaurantes: 136810,
    transportes: 57771,
    serv_prof: 75252,
    serv_soc: 152571,
    serv_div: 199244,
    gobierno: 68994,
  },
  {
    p: "III 19",
    agric: 454438,
    ind_ext: 8719,
    manufactura: 267862,
    construccion: 176036,
    comercio: 426285,
    restaurantes: 151123,
    transportes: 62567,
    serv_prof: 80249,
    serv_soc: 158807,
    serv_div: 174871,
    gobierno: 74987,
  },
  {
    p: "IV 19",
    agric: 467180,
    ind_ext: 7740,
    manufactura: 218203,
    construccion: 168835,
    comercio: 438869,
    restaurantes: 145138,
    transportes: 73466,
    serv_prof: 76903,
    serv_soc: 172129,
    serv_div: 195079,
    gobierno: 78020,
  },
  {
    p: "I 20",
    agric: 498819,
    ind_ext: 9831,
    manufactura: 222109,
    construccion: 163651,
    comercio: 417700,
    restaurantes: 160209,
    transportes: 65648,
    serv_prof: 88250,
    serv_soc: 178726,
    serv_div: 190620,
    gobierno: 83023,
  },
  {
    p: "III 20",
    agric: 474998,
    ind_ext: 7023,
    manufactura: 182521,
    construccion: 143055,
    comercio: 376067,
    restaurantes: 118603,
    transportes: 74170,
    serv_prof: 90612,
    serv_soc: 186086,
    serv_div: 172685,
    gobierno: 75457,
  },
  {
    p: "IV 20",
    agric: 393908,
    ind_ext: 10177,
    manufactura: 183579,
    construccion: 157674,
    comercio: 429136,
    restaurantes: 122685,
    transportes: 86412,
    serv_prof: 93345,
    serv_soc: 155191,
    serv_div: 212442,
    gobierno: 81526,
  },
  {
    p: "I 21",
    agric: 533505,
    ind_ext: 7495,
    manufactura: 236170,
    construccion: 153400,
    comercio: 371583,
    restaurantes: 108546,
    transportes: 56181,
    serv_prof: 72534,
    serv_soc: 147262,
    serv_div: 184748,
    gobierno: 67443,
  },
  {
    p: "II 21",
    agric: 461031,
    ind_ext: 3142,
    manufactura: 235994,
    construccion: 152376,
    comercio: 424383,
    restaurantes: 117534,
    transportes: 89448,
    serv_prof: 87630,
    serv_soc: 162223,
    serv_div: 182508,
    gobierno: 79142,
  },
  {
    p: "III 21",
    agric: 477133,
    ind_ext: 18605,
    manufactura: 213427,
    construccion: 179318,
    comercio: 413841,
    restaurantes: 144284,
    transportes: 87011,
    serv_prof: 110988,
    serv_soc: 199915,
    serv_div: 183415,
    gobierno: 94055,
  },
  {
    p: "IV 21",
    agric: 482245,
    ind_ext: 18419,
    manufactura: 179580,
    construccion: 184830,
    comercio: 405999,
    restaurantes: 146350,
    transportes: 82254,
    serv_prof: 104544,
    serv_soc: 196606,
    serv_div: 224202,
    gobierno: 84711,
  },
  {
    p: "I 22",
    agric: 455447,
    ind_ext: 11651,
    manufactura: 230031,
    construccion: 196289,
    comercio: 463933,
    restaurantes: 140781,
    transportes: 79116,
    serv_prof: 104975,
    serv_soc: 203319,
    serv_div: 205712,
    gobierno: 75893,
  },
  {
    p: "II 22",
    agric: 446453,
    ind_ext: 13374,
    manufactura: 263853,
    construccion: 214837,
    comercio: 443272,
    restaurantes: 156930,
    transportes: 79909,
    serv_prof: 99434,
    serv_soc: 186220,
    serv_div: 209246,
    gobierno: 82741,
  },
  {
    p: "III 22",
    agric: 491964,
    ind_ext: 12669,
    manufactura: 269561,
    construccion: 196890,
    comercio: 460804,
    restaurantes: 146114,
    transportes: 84903,
    serv_prof: 86788,
    serv_soc: 174704,
    serv_div: 206852,
    gobierno: 71489,
  },
  {
    p: "IV 22",
    agric: 501741,
    ind_ext: 13578,
    manufactura: 251151,
    construccion: 199663,
    comercio: 457126,
    restaurantes: 151427,
    transportes: 84798,
    serv_prof: 93619,
    serv_soc: 165053,
    serv_div: 214372,
    gobierno: 75114,
  },
  {
    p: "I 23",
    agric: 491907,
    ind_ext: 9457,
    manufactura: 230678,
    construccion: 186739,
    comercio: 445844,
    restaurantes: 169607,
    transportes: 90984,
    serv_prof: 95329,
    serv_soc: 160426,
    serv_div: 196303,
    gobierno: 74500,
  },
  {
    p: "II 23",
    agric: 461873,
    ind_ext: 6935,
    manufactura: 273682,
    construccion: 202706,
    comercio: 436625,
    restaurantes: 174992,
    transportes: 81522,
    serv_prof: 111814,
    serv_soc: 159670,
    serv_div: 193501,
    gobierno: 68584,
  },
  {
    p: "III 23",
    agric: 502834,
    ind_ext: 9647,
    manufactura: 266453,
    construccion: 180132,
    comercio: 404213,
    restaurantes: 175434,
    transportes: 89019,
    serv_prof: 116830,
    serv_soc: 169307,
    serv_div: 230593,
    gobierno: 81558,
  },
  {
    p: "IV 23",
    agric: 511437,
    ind_ext: 8997,
    manufactura: 229781,
    construccion: 184818,
    comercio: 456621,
    restaurantes: 163219,
    transportes: 83688,
    serv_prof: 110742,
    serv_soc: 142303,
    serv_div: 223148,
    gobierno: 103767,
  },
  {
    p: "I 24",
    agric: 504092,
    ind_ext: 9293,
    manufactura: 265084,
    construccion: 178160,
    comercio: 456743,
    restaurantes: 184134,
    transportes: 87326,
    serv_prof: 117606,
    serv_soc: 157532,
    serv_div: 212240,
    gobierno: 93553,
  },
  {
    p: "II 24",
    agric: 413577,
    ind_ext: 5633,
    manufactura: 315626,
    construccion: 167732,
    comercio: 466885,
    restaurantes: 186668,
    transportes: 90697,
    serv_prof: 124156,
    serv_soc: 157342,
    serv_div: 215179,
    gobierno: 98367,
  },
  {
    p: "III 24",
    agric: 406551,
    ind_ext: 10229,
    manufactura: 279509,
    construccion: 167940,
    comercio: 467432,
    restaurantes: 184420,
    transportes: 85468,
    serv_prof: 131462,
    serv_soc: 173240,
    serv_div: 189798,
    gobierno: 89195,
  },
  {
    p: "IV 24",
    agric: 392251,
    ind_ext: 5431,
    manufactura: 283808,
    construccion: 166263,
    comercio: 508018,
    restaurantes: 172126,
    transportes: 69927,
    serv_prof: 113665,
    serv_soc: 183030,
    serv_div: 232632,
    gobierno: 87629,
  },
  {
    p: "I 25",
    agric: 418674,
    ind_ext: 7579,
    manufactura: 287624,
    construccion: 184990,
    comercio: 493890,
    restaurantes: 190067,
    transportes: 77083,
    serv_prof: 110432,
    serv_soc: 177156,
    serv_div: 194359,
    gobierno: 79918,
  },
  {
    p: "II 25",
    agric: 387463,
    ind_ext: 6507,
    manufactura: 273025,
    construccion: 203205,
    comercio: 505614,
    restaurantes: 188372,
    transportes: 75596,
    serv_prof: 112368,
    serv_soc: 191858,
    serv_div: 226940,
    gobierno: 84643,
  },
  {
    p: "III 25",
    agric: 401351,
    ind_ext: 6009,
    manufactura: 248678,
    construccion: 208466,
    comercio: 540530,
    restaurantes: 164360,
    transportes: 64175,
    serv_prof: 92564,
    serv_soc: 186842,
    serv_div: 233696,
    gobierno: 73141,
  },
  {
    p: "IV 25",
    agric: 457377,
    ind_ext: 6051,
    manufactura: 231528,
    construccion: 193505,
    comercio: 482689,
    restaurantes: 172729,
    transportes: 74919,
    serv_prof: 102107,
    serv_soc: 179330,
    serv_div: 235745,
    gobierno: 83240,
  },
];

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 3 · DATOS — IMSS CUBOS REALES · Michoacán 2016–2026
// ────────────────────────────────────────────────────────────────────────────
//  Fuente: IMSS CUBOS (PPWEB) · imss.gob.mx
//  Frecuencia: mensual  |  Período: "Ene 16" = Enero 2016
//  Series disponibles:
//    IMSS_PT_TOTAL        →  Total de puestos de trabajo asegurados
//    IMSS_PT_PERM         →  Trabajadores permanentes (total)
//    IMSS_PT_EV           →  Trabajadores eventuales (total)
//    IMSS_PT_PERM_CAMPO   →  Permanentes del campo
//    IMSS_PT_PERM_URB     →  Permanentes urbanos
//    IMSS_PT_EV_CAMPO     →  Eventuales del campo
//    IMSS_PT_EV_URB       →  Eventuales urbanos
//  ⚠️  Para actualizar: agrega el nuevo período al final de cada array.
// ════════════════════════════════════════════════════════════════════════════
//  Fuente: IMSS CUBOS (PPWEB). Datos mensuales. Formato "Ene 16" = Enero 2016.
const IMSS_PT_TOTAL = [
  { p: "Ene 16", tot: 383765 },
  { p: "Feb 16", tot: 388661 },
  { p: "Mar 16", tot: 392199 },
  { p: "Abr 16", tot: 393602 },
  { p: "May 16", tot: 392801 },
  { p: "Jun 16", tot: 396296 },
  { p: "Jul 16", tot: 393066 },
  { p: "Ago 16", tot: 395878 },
  { p: "Sep 16", tot: 399523 },
  { p: "Oct 16", tot: 403719 },
  { p: "Nov 16", tot: 408828 },
  { p: "Dic 16", tot: 406789 },
  { p: "Ene 17", tot: 406741 },
  { p: "Feb 17", tot: 410366 },
  { p: "Mar 17", tot: 419378 },
  { p: "Abr 17", tot: 420703 },
  { p: "May 17", tot: 421186 },
  { p: "Jun 17", tot: 422606 },
  { p: "Jul 17", tot: 419987 },
  { p: "Ago 17", tot: 423412 },
  { p: "Sep 17", tot: 427972 },
  { p: "Oct 17", tot: 435403 },
  { p: "Nov 17", tot: 440013 },
  { p: "Dic 17", tot: 437859 },
  { p: "Ene 18", tot: 439901 },
  { p: "Feb 18", tot: 445749 },
  { p: "Mar 18", tot: 447632 },
  { p: "Abr 18", tot: 445800 },
  { p: "May 18", tot: 444445 },
  { p: "Jun 18", tot: 445112 },
  { p: "Jul 18", tot: 445290 },
  { p: "Ago 18", tot: 444585 },
  { p: "Sep 18", tot: 446509 },
  { p: "Oct 18", tot: 454501 },
  { p: "Nov 18", tot: 456703 },
  { p: "Dic 18", tot: 454081 },
  { p: "Ene 19", tot: 454066 },
  { p: "Feb 19", tot: 459644 },
  { p: "Mar 19", tot: 459369 },
  { p: "Abr 19", tot: 458462 },
  { p: "May 19", tot: 456145 },
  { p: "Jun 19", tot: 452159 },
  { p: "Jul 19", tot: 454458 },
  { p: "Ago 19", tot: 454628 },
  { p: "Sep 19", tot: 455797 },
  { p: "Oct 19", tot: 464231 },
  { p: "Nov 19", tot: 466606 },
  { p: "Dic 19", tot: 463598 },
  { p: "Ene 20", tot: 463431 },
  { p: "Feb 20", tot: 468015 },
  { p: "Mar 20", tot: 467532 },
  { p: "Abr 20", tot: 463661 },
  { p: "May 20", tot: 453381 },
  { p: "Jun 20", tot: 450498 },
  { p: "Jul 20", tot: 447862 },
  { p: "Ago 20", tot: 451388 },
  { p: "Sep 20", tot: 453937 },
  { p: "Oct 20", tot: 459604 },
  { p: "Nov 20", tot: 463651 },
  { p: "Dic 20", tot: 461602 },
  { p: "Ene 21", tot: 458944 },
  { p: "Feb 21", tot: 462035 },
  { p: "Mar 21", tot: 462309 },
  { p: "Abr 21", tot: 460254 },
  { p: "May 21", tot: 458518 },
  { p: "Jun 21", tot: 460645 },
  { p: "Jul 21", tot: 459348 },
  { p: "Ago 21", tot: 461649 },
  { p: "Sep 21", tot: 464742 },
  { p: "Oct 21", tot: 466916 },
  { p: "Nov 21", tot: 470114 },
  { p: "Dic 21", tot: 465270 },
  { p: "Ene 22", tot: 465152 },
  { p: "Feb 22", tot: 467596 },
  { p: "Mar 22", tot: 468910 },
  { p: "Abr 22", tot: 466191 },
  { p: "May 22", tot: 464925 },
  { p: "Jun 22", tot: 464051 },
  { p: "Jul 22", tot: 462669 },
  { p: "Ago 22", tot: 468793 },
  { p: "Sep 22", tot: 469527 },
  { p: "Oct 22", tot: 477361 },
  { p: "Nov 22", tot: 479689 },
  { p: "Dic 22", tot: 474615 },
  { p: "Ene 23", tot: 476174 },
  { p: "Feb 23", tot: 479469 },
  { p: "Mar 23", tot: 482835 },
  { p: "Abr 23", tot: 481144 },
  { p: "May 23", tot: 480918 },
  { p: "Jun 23", tot: 478147 },
  { p: "Jul 23", tot: 477574 },
  { p: "Ago 23", tot: 478548 },
  { p: "Sep 23", tot: 481809 },
  { p: "Oct 23", tot: 488069 },
  { p: "Nov 23", tot: 490970 },
  { p: "Dic 23", tot: 486480 },
  { p: "Ene 24", tot: 489878 },
  { p: "Feb 24", tot: 492055 },
  { p: "Mar 24", tot: 489862 },
  { p: "Abr 24", tot: 489833 },
  { p: "May 24", tot: 486534 },
  { p: "Jun 24", tot: 481459 },
  { p: "Jul 24", tot: 480556 },
  { p: "Ago 24", tot: 482100 },
  { p: "Sep 24", tot: 483864 },
  { p: "Oct 24", tot: 491783 },
  { p: "Nov 24", tot: 495903 },
  { p: "Dic 24", tot: 493753 },
  { p: "Ene 25", tot: 495006 },
  { p: "Feb 25", tot: 493501 },
  { p: "Mar 25", tot: 495462 },
  { p: "Abr 25", tot: 497711 },
  { p: "May 25", tot: 496594 },
  { p: "Jun 25", tot: 493114 },
  { p: "Jul 25", tot: 493725 },
  { p: "Ago 25", tot: 491366 },
  { p: "Sep 25", tot: 499134 },
  { p: "Oct 25", tot: 501469 },
  { p: "Nov 25", tot: 498624 },
  { p: "Dic 25", tot: 496049 },
  { p: "Ene 26", tot: 499842 },
  { p: "Feb 26", tot: 501402 },
];
const IMSS_PT_PERM = [
  { p: "Ene 16", perm: 319312 },
  { p: "Feb 16", perm: 322329 },
  { p: "Mar 16", perm: 324210 },
  { p: "Abr 16", perm: 327031 },
  { p: "May 16", perm: 327637 },
  { p: "Jun 16", perm: 329790 },
  { p: "Jul 16", perm: 328418 },
  { p: "Ago 16", perm: 331300 },
  { p: "Sep 16", perm: 335109 },
  { p: "Oct 16", perm: 337255 },
  { p: "Nov 16", perm: 340996 },
  { p: "Dic 16", perm: 339645 },
  { p: "Ene 17", perm: 337971 },
  { p: "Feb 17", perm: 340163 },
  { p: "Mar 17", perm: 347121 },
  { p: "Abr 17", perm: 349980 },
  { p: "May 17", perm: 352241 },
  { p: "Jun 17", perm: 353166 },
  { p: "Jul 17", perm: 350420 },
  { p: "Ago 17", perm: 354492 },
  { p: "Sep 17", perm: 358680 },
  { p: "Oct 17", perm: 362508 },
  { p: "Nov 17", perm: 363689 },
  { p: "Dic 17", perm: 362895 },
  { p: "Ene 18", perm: 362573 },
  { p: "Feb 18", perm: 366642 },
  { p: "Mar 18", perm: 367391 },
  { p: "Abr 18", perm: 365647 },
  { p: "May 18", perm: 365547 },
  { p: "Jun 18", perm: 366976 },
  { p: "Jul 18", perm: 365415 },
  { p: "Ago 18", perm: 364985 },
  { p: "Sep 18", perm: 367969 },
  { p: "Oct 18", perm: 373180 },
  { p: "Nov 18", perm: 373261 },
  { p: "Dic 18", perm: 371850 },
  { p: "Ene 19", perm: 371353 },
  { p: "Feb 19", perm: 374546 },
  { p: "Mar 19", perm: 374396 },
  { p: "Abr 19", perm: 372809 },
  { p: "May 19", perm: 372651 },
  { p: "Jun 19", perm: 371742 },
  { p: "Jul 19", perm: 369723 },
  { p: "Ago 19", perm: 371576 },
  { p: "Sep 19", perm: 373419 },
  { p: "Oct 19", perm: 378651 },
  { p: "Nov 19", perm: 380625 },
  { p: "Dic 19", perm: 378723 },
  { p: "Ene 20", perm: 377104 },
  { p: "Feb 20", perm: 380169 },
  { p: "Mar 20", perm: 380406 },
  { p: "Abr 20", perm: 377942 },
  { p: "May 20", perm: 372718 },
  { p: "Jun 20", perm: 370151 },
  { p: "Jul 20", perm: 368777 },
  { p: "Ago 20", perm: 371260 },
  { p: "Sep 20", perm: 373156 },
  { p: "Oct 20", perm: 374758 },
  { p: "Nov 20", perm: 376465 },
  { p: "Dic 20", perm: 374858 },
  { p: "Ene 21", perm: 373236 },
  { p: "Feb 21", perm: 374766 },
  { p: "Mar 21", perm: 374018 },
  { p: "Abr 21", perm: 374312 },
  { p: "May 21", perm: 374245 },
  { p: "Jun 21", perm: 374790 },
  { p: "Jul 21", perm: 380905 },
  { p: "Ago 21", perm: 382627 },
  { p: "Sep 21", perm: 385839 },
  { p: "Oct 21", perm: 387386 },
  { p: "Nov 21", perm: 389433 },
  { p: "Dic 21", perm: 386934 },
  { p: "Ene 22", perm: 385889 },
  { p: "Feb 22", perm: 386961 },
  { p: "Mar 22", perm: 387753 },
  { p: "Abr 22", perm: 387847 },
  { p: "May 22", perm: 388661 },
  { p: "Jun 22", perm: 388215 },
  { p: "Jul 22", perm: 387737 },
  { p: "Ago 22", perm: 390570 },
  { p: "Sep 22", perm: 391085 },
  { p: "Oct 22", perm: 394193 },
  { p: "Nov 22", perm: 395937 },
  { p: "Dic 22", perm: 393547 },
  { p: "Ene 23", perm: 392909 },
  { p: "Feb 23", perm: 394743 },
  { p: "Mar 23", perm: 397001 },
  { p: "Abr 23", perm: 397736 },
  { p: "May 23", perm: 398752 },
  { p: "Jun 23", perm: 398297 },
  { p: "Jul 23", perm: 396499 },
  { p: "Ago 23", perm: 398624 },
  { p: "Sep 23", perm: 401056 },
  { p: "Oct 23", perm: 404054 },
  { p: "Nov 23", perm: 405730 },
  { p: "Dic 23", perm: 402699 },
  { p: "Ene 24", perm: 402590 },
  { p: "Feb 24", perm: 404423 },
  { p: "Mar 24", perm: 404723 },
  { p: "Abr 24", perm: 405116 },
  { p: "May 24", perm: 406143 },
  { p: "Jun 24", perm: 404783 },
  { p: "Jul 24", perm: 403971 },
  { p: "Ago 24", perm: 405994 },
  { p: "Sep 24", perm: 407604 },
  { p: "Oct 24", perm: 412856 },
  { p: "Nov 24", perm: 414731 },
  { p: "Dic 24", perm: 414169 },
  { p: "Ene 25", perm: 412779 },
  { p: "Feb 25", perm: 410587 },
  { p: "Mar 25", perm: 411956 },
  { p: "Abr 25", perm: 416622 },
  { p: "May 25", perm: 418156 },
  { p: "Jun 25", perm: 417073 },
  { p: "Jul 25", perm: 417807 },
  { p: "Ago 25", perm: 416842 },
  { p: "Sep 25", perm: 422121 },
  { p: "Oct 25", perm: 421162 },
  { p: "Nov 25", perm: 418734 },
  { p: "Dic 25", perm: 416572 },
  { p: "Ene 26", perm: 417607 },
  { p: "Feb 26", perm: 418350 },
];
const IMSS_PT_EV = [
  { p: "Ene 16", ev: 64453 },
  { p: "Feb 16", ev: 66332 },
  { p: "Mar 16", ev: 67989 },
  { p: "Abr 16", ev: 66571 },
  { p: "May 16", ev: 65164 },
  { p: "Jun 16", ev: 66506 },
  { p: "Jul 16", ev: 64648 },
  { p: "Ago 16", ev: 64578 },
  { p: "Sep 16", ev: 64414 },
  { p: "Oct 16", ev: 66464 },
  { p: "Nov 16", ev: 67832 },
  { p: "Dic 16", ev: 67144 },
  { p: "Ene 17", ev: 68770 },
  { p: "Feb 17", ev: 70203 },
  { p: "Mar 17", ev: 72257 },
  { p: "Abr 17", ev: 70723 },
  { p: "May 17", ev: 68945 },
  { p: "Jun 17", ev: 69440 },
  { p: "Jul 17", ev: 69567 },
  { p: "Ago 17", ev: 68920 },
  { p: "Sep 17", ev: 69292 },
  { p: "Oct 17", ev: 72895 },
  { p: "Nov 17", ev: 76324 },
  { p: "Dic 17", ev: 74964 },
  { p: "Ene 18", ev: 77328 },
  { p: "Feb 18", ev: 79107 },
  { p: "Mar 18", ev: 80241 },
  { p: "Abr 18", ev: 80153 },
  { p: "May 18", ev: 78898 },
  { p: "Jun 18", ev: 78136 },
  { p: "Jul 18", ev: 79875 },
  { p: "Ago 18", ev: 79600 },
  { p: "Sep 18", ev: 78540 },
  { p: "Oct 18", ev: 81321 },
  { p: "Nov 18", ev: 83442 },
  { p: "Dic 18", ev: 82231 },
  { p: "Ene 19", ev: 82713 },
  { p: "Feb 19", ev: 85098 },
  { p: "Mar 19", ev: 84973 },
  { p: "Abr 19", ev: 85653 },
  { p: "May 19", ev: 83494 },
  { p: "Jun 19", ev: 80417 },
  { p: "Jul 19", ev: 84735 },
  { p: "Ago 19", ev: 83052 },
  { p: "Sep 19", ev: 82378 },
  { p: "Oct 19", ev: 85580 },
  { p: "Nov 19", ev: 85981 },
  { p: "Dic 19", ev: 84875 },
  { p: "Ene 20", ev: 86327 },
  { p: "Feb 20", ev: 87846 },
  { p: "Mar 20", ev: 87126 },
  { p: "Abr 20", ev: 85719 },
  { p: "May 20", ev: 80663 },
  { p: "Jun 20", ev: 80347 },
  { p: "Jul 20", ev: 79085 },
  { p: "Ago 20", ev: 80128 },
  { p: "Sep 20", ev: 80781 },
  { p: "Oct 20", ev: 84846 },
  { p: "Nov 20", ev: 87186 },
  { p: "Dic 20", ev: 86744 },
  { p: "Ene 21", ev: 85708 },
  { p: "Feb 21", ev: 87269 },
  { p: "Mar 21", ev: 88291 },
  { p: "Abr 21", ev: 85942 },
  { p: "May 21", ev: 84273 },
  { p: "Jun 21", ev: 85855 },
  { p: "Jul 21", ev: 78443 },
  { p: "Ago 21", ev: 79022 },
  { p: "Sep 21", ev: 78903 },
  { p: "Oct 21", ev: 79530 },
  { p: "Nov 21", ev: 80681 },
  { p: "Dic 21", ev: 78336 },
  { p: "Ene 22", ev: 79263 },
  { p: "Feb 22", ev: 80635 },
  { p: "Mar 22", ev: 81157 },
  { p: "Abr 22", ev: 78344 },
  { p: "May 22", ev: 76264 },
  { p: "Jun 22", ev: 75836 },
  { p: "Jul 22", ev: 74932 },
  { p: "Ago 22", ev: 78223 },
  { p: "Sep 22", ev: 78442 },
  { p: "Oct 22", ev: 83168 },
  { p: "Nov 22", ev: 83752 },
  { p: "Dic 22", ev: 81068 },
  { p: "Ene 23", ev: 83265 },
  { p: "Feb 23", ev: 84726 },
  { p: "Mar 23", ev: 85834 },
  { p: "Abr 23", ev: 83408 },
  { p: "May 23", ev: 82166 },
  { p: "Jun 23", ev: 79850 },
  { p: "Jul 23", ev: 81075 },
  { p: "Ago 23", ev: 79924 },
  { p: "Sep 23", ev: 80753 },
  { p: "Oct 23", ev: 84015 },
  { p: "Nov 23", ev: 85240 },
  { p: "Dic 23", ev: 83781 },
  { p: "Ene 24", ev: 87288 },
  { p: "Feb 24", ev: 87632 },
  { p: "Mar 24", ev: 85139 },
  { p: "Abr 24", ev: 84717 },
  { p: "May 24", ev: 80391 },
  { p: "Jun 24", ev: 76676 },
  { p: "Jul 24", ev: 76585 },
  { p: "Ago 24", ev: 76106 },
  { p: "Sep 24", ev: 76260 },
  { p: "Oct 24", ev: 78927 },
  { p: "Nov 24", ev: 81172 },
  { p: "Dic 24", ev: 79584 },
  { p: "Ene 25", ev: 82227 },
  { p: "Feb 25", ev: 82914 },
  { p: "Mar 25", ev: 83506 },
  { p: "Abr 25", ev: 81089 },
  { p: "May 25", ev: 78438 },
  { p: "Jun 25", ev: 76041 },
  { p: "Jul 25", ev: 75918 },
  { p: "Ago 25", ev: 74524 },
  { p: "Sep 25", ev: 77013 },
  { p: "Oct 25", ev: 80307 },
  { p: "Nov 25", ev: 79890 },
  { p: "Dic 25", ev: 79477 },
  { p: "Ene 26", ev: 82235 },
  { p: "Feb 26", ev: 83052 },
];
const IMSS_PT_EV_CAMPO = [
  { p: "Ene 16", ev_campo: 16637 },
  { p: "Feb 16", ev_campo: 17809 },
  { p: "Mar 16", ev_campo: 18629 },
  { p: "Abr 16", ev_campo: 17243 },
  { p: "May 16", ev_campo: 15356 },
  { p: "Jun 16", ev_campo: 15082 },
  { p: "Jul 16", ev_campo: 13033 },
  { p: "Ago 16", ev_campo: 15398 },
  { p: "Sep 16", ev_campo: 15928 },
  { p: "Oct 16", ev_campo: 16868 },
  { p: "Nov 16", ev_campo: 17569 },
  { p: "Dic 16", ev_campo: 19184 },
  { p: "Ene 17", ev_campo: 19920 },
  { p: "Feb 17", ev_campo: 19688 },
  { p: "Mar 17", ev_campo: 20175 },
  { p: "Abr 17", ev_campo: 18768 },
  { p: "May 17", ev_campo: 17036 },
  { p: "Jun 17", ev_campo: 16927 },
  { p: "Jul 17", ev_campo: 16822 },
  { p: "Ago 17", ev_campo: 17182 },
  { p: "Sep 17", ev_campo: 17512 },
  { p: "Oct 17", ev_campo: 20456 },
  { p: "Nov 17", ev_campo: 22482 },
  { p: "Dic 17", ev_campo: 23347 },
  { p: "Ene 18", ev_campo: 24116 },
  { p: "Feb 18", ev_campo: 24461 },
  { p: "Mar 18", ev_campo: 23700 },
  { p: "Abr 18", ev_campo: 22951 },
  { p: "May 18", ev_campo: 21280 },
  { p: "Jun 18", ev_campo: 20278 },
  { p: "Jul 18", ev_campo: 21012 },
  { p: "Ago 18", ev_campo: 21001 },
  { p: "Sep 18", ev_campo: 21988 },
  { p: "Oct 18", ev_campo: 23231 },
  { p: "Nov 18", ev_campo: 25359 },
  { p: "Dic 18", ev_campo: 25780 },
  { p: "Ene 19", ev_campo: 26186 },
  { p: "Feb 19", ev_campo: 27049 },
  { p: "Mar 19", ev_campo: 25438 },
  { p: "Abr 19", ev_campo: 25068 },
  { p: "May 19", ev_campo: 22270 },
  { p: "Jun 19", ev_campo: 19659 },
  { p: "Jul 19", ev_campo: 19930 },
  { p: "Ago 19", ev_campo: 20298 },
  { p: "Sep 19", ev_campo: 22766 },
  { p: "Oct 19", ev_campo: 25416 },
  { p: "Nov 19", ev_campo: 26531 },
  { p: "Dic 19", ev_campo: 26647 },
  { p: "Ene 20", ev_campo: 27189 },
  { p: "Feb 20", ev_campo: 27201 },
  { p: "Mar 20", ev_campo: 24672 },
  { p: "Abr 20", ev_campo: 25410 },
  { p: "May 20", ev_campo: 22171 },
  { p: "Jun 20", ev_campo: 21884 },
  { p: "Jul 20", ev_campo: 21208 },
  { p: "Ago 20", ev_campo: 22109 },
  { p: "Sep 20", ev_campo: 22026 },
  { p: "Oct 20", ev_campo: 24376 },
  { p: "Nov 20", ev_campo: 25591 },
  { p: "Dic 20", ev_campo: 26650 },
  { p: "Ene 21", ev_campo: 25758 },
  { p: "Feb 21", ev_campo: 25576 },
  { p: "Mar 21", ev_campo: 25192 },
  { p: "Abr 21", ev_campo: 23402 },
  { p: "May 21", ev_campo: 21728 },
  { p: "Jun 21", ev_campo: 22245 },
  { p: "Jul 21", ev_campo: 22251 },
  { p: "Ago 21", ev_campo: 23809 },
  { p: "Sep 21", ev_campo: 25425 },
  { p: "Oct 21", ev_campo: 25663 },
  { p: "Nov 21", ev_campo: 28532 },
  { p: "Dic 21", ev_campo: 28390 },
  { p: "Ene 22", ev_campo: 29189 },
  { p: "Feb 22", ev_campo: 30311 },
  { p: "Mar 22", ev_campo: 29594 },
  { p: "Abr 22", ev_campo: 26663 },
  { p: "May 22", ev_campo: 25288 },
  { p: "Jun 22", ev_campo: 23933 },
  { p: "Jul 22", ev_campo: 23112 },
  { p: "Ago 22", ev_campo: 25945 },
  { p: "Sep 22", ev_campo: 26613 },
  { p: "Oct 22", ev_campo: 30298 },
  { p: "Nov 22", ev_campo: 30184 },
  { p: "Dic 22", ev_campo: 28368 },
  { p: "Ene 23", ev_campo: 29117 },
  { p: "Feb 23", ev_campo: 30286 },
  { p: "Mar 23", ev_campo: 30595 },
  { p: "Abr 23", ev_campo: 27620 },
  { p: "May 23", ev_campo: 26111 },
  { p: "Jun 23", ev_campo: 23667 },
  { p: "Jul 23", ev_campo: 24085 },
  { p: "Ago 23", ev_campo: 24626 },
  { p: "Sep 23", ev_campo: 25977 },
  { p: "Oct 23", ev_campo: 27570 },
  { p: "Nov 23", ev_campo: 28459 },
  { p: "Dic 23", ev_campo: 27827 },
  { p: "Ene 24", ev_campo: 30231 },
  { p: "Feb 24", ev_campo: 30101 },
  { p: "Mar 24", ev_campo: 27533 },
  { p: "Abr 24", ev_campo: 26696 },
  { p: "May 24", ev_campo: 23468 },
  { p: "Jun 24", ev_campo: 21505 },
  { p: "Jul 24", ev_campo: 20184 },
  { p: "Ago 24", ev_campo: 20302 },
  { p: "Sep 24", ev_campo: 21349 },
  { p: "Oct 24", ev_campo: 23842 },
  { p: "Nov 24", ev_campo: 25455 },
  { p: "Dic 24", ev_campo: 25525 },
  { p: "Ene 25", ev_campo: 27284 },
  { p: "Feb 25", ev_campo: 27377 },
  { p: "Mar 25", ev_campo: 26900 },
  { p: "Abr 25", ev_campo: 24531 },
  { p: "May 25", ev_campo: 22403 },
  { p: "Jun 25", ev_campo: 20574 },
  { p: "Jul 25", ev_campo: 19478 },
  { p: "Ago 25", ev_campo: 19423 },
  { p: "Sep 25", ev_campo: 20760 },
  { p: "Oct 25", ev_campo: 22127 },
  { p: "Nov 25", ev_campo: 22647 },
  { p: "Dic 25", ev_campo: 23787 },
  { p: "Ene 26", ev_campo: 25470 },
  { p: "Feb 26", ev_campo: 25104 },
];
const IMSS_PT_EV_URB = [
  { p: "Ene 16", ev_urb: 47816 },
  { p: "Feb 16", ev_urb: 48523 },
  { p: "Mar 16", ev_urb: 49360 },
  { p: "Abr 16", ev_urb: 49328 },
  { p: "May 16", ev_urb: 49808 },
  { p: "Jun 16", ev_urb: 51424 },
  { p: "Jul 16", ev_urb: 51615 },
  { p: "Ago 16", ev_urb: 49180 },
  { p: "Sep 16", ev_urb: 48486 },
  { p: "Oct 16", ev_urb: 49596 },
  { p: "Nov 16", ev_urb: 50263 },
  { p: "Dic 16", ev_urb: 47960 },
  { p: "Ene 17", ev_urb: 48850 },
  { p: "Feb 17", ev_urb: 50515 },
  { p: "Mar 17", ev_urb: 52082 },
  { p: "Abr 17", ev_urb: 51955 },
  { p: "May 17", ev_urb: 51909 },
  { p: "Jun 17", ev_urb: 52513 },
  { p: "Jul 17", ev_urb: 52745 },
  { p: "Ago 17", ev_urb: 51738 },
  { p: "Sep 17", ev_urb: 51780 },
  { p: "Oct 17", ev_urb: 52439 },
  { p: "Nov 17", ev_urb: 53842 },
  { p: "Dic 17", ev_urb: 51617 },
  { p: "Ene 18", ev_urb: 53212 },
  { p: "Feb 18", ev_urb: 54646 },
  { p: "Mar 18", ev_urb: 56541 },
  { p: "Abr 18", ev_urb: 57202 },
  { p: "May 18", ev_urb: 57618 },
  { p: "Jun 18", ev_urb: 57858 },
  { p: "Jul 18", ev_urb: 58863 },
  { p: "Ago 18", ev_urb: 58599 },
  { p: "Sep 18", ev_urb: 56552 },
  { p: "Oct 18", ev_urb: 58090 },
  { p: "Nov 18", ev_urb: 58083 },
  { p: "Dic 18", ev_urb: 56451 },
  { p: "Ene 19", ev_urb: 56527 },
  { p: "Feb 19", ev_urb: 58049 },
  { p: "Mar 19", ev_urb: 59535 },
  { p: "Abr 19", ev_urb: 60585 },
  { p: "May 19", ev_urb: 61224 },
  { p: "Jun 19", ev_urb: 60758 },
  { p: "Jul 19", ev_urb: 64805 },
  { p: "Ago 19", ev_urb: 62754 },
  { p: "Sep 19", ev_urb: 59612 },
  { p: "Oct 19", ev_urb: 60164 },
  { p: "Nov 19", ev_urb: 59450 },
  { p: "Dic 19", ev_urb: 58228 },
  { p: "Ene 20", ev_urb: 59138 },
  { p: "Feb 20", ev_urb: 60645 },
  { p: "Mar 20", ev_urb: 62454 },
  { p: "Abr 20", ev_urb: 60309 },
  { p: "May 20", ev_urb: 58492 },
  { p: "Jun 20", ev_urb: 58463 },
  { p: "Jul 20", ev_urb: 57877 },
  { p: "Ago 20", ev_urb: 58019 },
  { p: "Sep 20", ev_urb: 58755 },
  { p: "Oct 20", ev_urb: 60470 },
  { p: "Nov 20", ev_urb: 61595 },
  { p: "Dic 20", ev_urb: 60094 },
  { p: "Ene 21", ev_urb: 59950 },
  { p: "Feb 21", ev_urb: 61693 },
  { p: "Mar 21", ev_urb: 63099 },
  { p: "Abr 21", ev_urb: 62540 },
  { p: "May 21", ev_urb: 62545 },
  { p: "Jun 21", ev_urb: 63610 },
  { p: "Jul 21", ev_urb: 56192 },
  { p: "Ago 21", ev_urb: 55213 },
  { p: "Sep 21", ev_urb: 53478 },
  { p: "Oct 21", ev_urb: 53867 },
  { p: "Nov 21", ev_urb: 52149 },
  { p: "Dic 21", ev_urb: 49946 },
  { p: "Ene 22", ev_urb: 50074 },
  { p: "Feb 22", ev_urb: 50324 },
  { p: "Mar 22", ev_urb: 51563 },
  { p: "Abr 22", ev_urb: 51681 },
  { p: "May 22", ev_urb: 50976 },
  { p: "Jun 22", ev_urb: 51903 },
  { p: "Jul 22", ev_urb: 51820 },
  { p: "Ago 22", ev_urb: 52278 },
  { p: "Sep 22", ev_urb: 51829 },
  { p: "Oct 22", ev_urb: 52870 },
  { p: "Nov 22", ev_urb: 53568 },
  { p: "Dic 22", ev_urb: 52700 },
  { p: "Ene 23", ev_urb: 54148 },
  { p: "Feb 23", ev_urb: 54440 },
  { p: "Mar 23", ev_urb: 55239 },
  { p: "Abr 23", ev_urb: 55788 },
  { p: "May 23", ev_urb: 56055 },
  { p: "Jun 23", ev_urb: 56183 },
  { p: "Jul 23", ev_urb: 56990 },
  { p: "Ago 23", ev_urb: 55298 },
  { p: "Sep 23", ev_urb: 54776 },
  { p: "Oct 23", ev_urb: 56445 },
  { p: "Nov 23", ev_urb: 56781 },
  { p: "Dic 23", ev_urb: 55954 },
  { p: "Ene 24", ev_urb: 57057 },
  { p: "Feb 24", ev_urb: 57531 },
  { p: "Mar 24", ev_urb: 57606 },
  { p: "Abr 24", ev_urb: 58021 },
  { p: "May 24", ev_urb: 56923 },
  { p: "Jun 24", ev_urb: 55171 },
  { p: "Jul 24", ev_urb: 56401 },
  { p: "Ago 24", ev_urb: 55804 },
  { p: "Sep 24", ev_urb: 54911 },
  { p: "Oct 24", ev_urb: 55085 },
  { p: "Nov 24", ev_urb: 55717 },
  { p: "Dic 24", ev_urb: 54059 },
  { p: "Ene 25", ev_urb: 54943 },
  { p: "Feb 25", ev_urb: 55537 },
  { p: "Mar 25", ev_urb: 56606 },
  { p: "Abr 25", ev_urb: 56558 },
  { p: "May 25", ev_urb: 56035 },
  { p: "Jun 25", ev_urb: 55467 },
  { p: "Jul 25", ev_urb: 56440 },
  { p: "Ago 25", ev_urb: 55101 },
  { p: "Sep 25", ev_urb: 56253 },
  { p: "Oct 25", ev_urb: 58180 },
  { p: "Nov 25", ev_urb: 57243 },
  { p: "Dic 25", ev_urb: 55690 },
  { p: "Ene 26", ev_urb: 56765 },
  { p: "Feb 26", ev_urb: 57948 },
];
const IMSS_PT_PERM_CAMPO = [
  { p: "Ene 16", perm_campo: 20878 },
  { p: "Feb 16", perm_campo: 21389 },
  { p: "Mar 16", perm_campo: 21576 },
  { p: "Abr 16", perm_campo: 22212 },
  { p: "May 16", perm_campo: 21741 },
  { p: "Jun 16", perm_campo: 21795 },
  { p: "Jul 16", perm_campo: 21120 },
  { p: "Ago 16", perm_campo: 22288 },
  { p: "Sep 16", perm_campo: 23697 },
  { p: "Oct 16", perm_campo: 24130 },
  { p: "Nov 16", perm_campo: 24872 },
  { p: "Dic 16", perm_campo: 25240 },
  { p: "Ene 17", perm_campo: 25227 },
  { p: "Feb 17", perm_campo: 25493 },
  { p: "Mar 17", perm_campo: 29661 },
  { p: "Abr 17", perm_campo: 30196 },
  { p: "May 17", perm_campo: 32029 },
  { p: "Jun 17", perm_campo: 30516 },
  { p: "Jul 17", perm_campo: 28442 },
  { p: "Ago 17", perm_campo: 31506 },
  { p: "Sep 17", perm_campo: 33309 },
  { p: "Oct 17", perm_campo: 34474 },
  { p: "Nov 17", perm_campo: 34434 },
  { p: "Dic 17", perm_campo: 34579 },
  { p: "Ene 18", perm_campo: 34902 },
  { p: "Feb 18", perm_campo: 36027 },
  { p: "Mar 18", perm_campo: 35788 },
  { p: "Abr 18", perm_campo: 33374 },
  { p: "May 18", perm_campo: 33463 },
  { p: "Jun 18", perm_campo: 33294 },
  { p: "Jul 18", perm_campo: 32566 },
  { p: "Ago 18", perm_campo: 31707 },
  { p: "Sep 18", perm_campo: 33068 },
  { p: "Oct 18", perm_campo: 35886 },
  { p: "Nov 18", perm_campo: 34229 },
  { p: "Dic 18", perm_campo: 34516 },
  { p: "Ene 19", perm_campo: 34949 },
  { p: "Feb 19", perm_campo: 36114 },
  { p: "Mar 19", perm_campo: 35125 },
  { p: "Abr 19", perm_campo: 33837 },
  { p: "May 19", perm_campo: 33382 },
  { p: "Jun 19", perm_campo: 33198 },
  { p: "Jul 19", perm_campo: 31865 },
  { p: "Ago 19", perm_campo: 32193 },
  { p: "Sep 19", perm_campo: 33459 },
  { p: "Oct 19", perm_campo: 35274 },
  { p: "Nov 19", perm_campo: 34711 },
  { p: "Dic 19", perm_campo: 35675 },
  { p: "Ene 20", perm_campo: 35059 },
  { p: "Feb 20", perm_campo: 34910 },
  { p: "Mar 20", perm_campo: 35304 },
  { p: "Abr 20", perm_campo: 35719 },
  { p: "May 20", perm_campo: 33953 },
  { p: "Jun 20", perm_campo: 33357 },
  { p: "Jul 20", perm_campo: 32800 },
  { p: "Ago 20", perm_campo: 34408 },
  { p: "Sep 20", perm_campo: 35488 },
  { p: "Oct 20", perm_campo: 36189 },
  { p: "Nov 20", perm_campo: 36294 },
  { p: "Dic 20", perm_campo: 35506 },
  { p: "Ene 21", perm_campo: 35818 },
  { p: "Feb 21", perm_campo: 35678 },
  { p: "Mar 21", perm_campo: 34939 },
  { p: "Abr 21", perm_campo: 34540 },
  { p: "May 21", perm_campo: 34223 },
  { p: "Jun 21", perm_campo: 33909 },
  { p: "Jul 21", perm_campo: 32898 },
  { p: "Ago 21", perm_campo: 33934 },
  { p: "Sep 21", perm_campo: 35956 },
  { p: "Oct 21", perm_campo: 37173 },
  { p: "Nov 21", perm_campo: 37766 },
  { p: "Dic 21", perm_campo: 37097 },
  { p: "Ene 22", perm_campo: 36880 },
  { p: "Feb 22", perm_campo: 36724 },
  { p: "Mar 22", perm_campo: 36560 },
  { p: "Abr 22", perm_campo: 36279 },
  { p: "May 22", perm_campo: 35658 },
  { p: "Jun 22", perm_campo: 35066 },
  { p: "Jul 22", perm_campo: 35218 },
  { p: "Ago 22", perm_campo: 35902 },
  { p: "Sep 22", perm_campo: 35387 },
  { p: "Oct 22", perm_campo: 35662 },
  { p: "Nov 22", perm_campo: 35765 },
  { p: "Dic 22", perm_campo: 35305 },
  { p: "Ene 23", perm_campo: 35497 },
  { p: "Feb 23", perm_campo: 35130 },
  { p: "Mar 23", perm_campo: 34857 },
  { p: "Abr 23", perm_campo: 34622 },
  { p: "May 23", perm_campo: 33930 },
  { p: "Jun 23", perm_campo: 33392 },
  { p: "Jul 23", perm_campo: 32669 },
  { p: "Ago 23", perm_campo: 33658 },
  { p: "Sep 23", perm_campo: 34218 },
  { p: "Oct 23", perm_campo: 34457 },
  { p: "Nov 23", perm_campo: 34200 },
  { p: "Dic 23", perm_campo: 34065 },
  { p: "Ene 24", perm_campo: 34162 },
  { p: "Feb 24", perm_campo: 34092 },
  { p: "Mar 24", perm_campo: 33790 },
  { p: "Abr 24", perm_campo: 32643 },
  { p: "May 24", perm_campo: 32168 },
  { p: "Jun 24", perm_campo: 31362 },
  { p: "Jul 24", perm_campo: 31254 },
  { p: "Ago 24", perm_campo: 31450 },
  { p: "Sep 24", perm_campo: 31658 },
  { p: "Oct 24", perm_campo: 30493 },
  { p: "Nov 24", perm_campo: 30870 },
  { p: "Dic 24", perm_campo: 30534 },
  { p: "Ene 25", perm_campo: 30657 },
  { p: "Feb 25", perm_campo: 30653 },
  { p: "Mar 25", perm_campo: 30130 },
  { p: "Abr 25", perm_campo: 30265 },
  { p: "May 25", perm_campo: 29691 },
  { p: "Jun 25", perm_campo: 29376 },
  { p: "Jul 25", perm_campo: 29789 },
  { p: "Ago 25", perm_campo: 29737 },
  { p: "Sep 25", perm_campo: 29703 },
  { p: "Oct 25", perm_campo: 28446 },
  { p: "Nov 25", perm_campo: 28739 },
  { p: "Dic 25", perm_campo: 29166 },
  { p: "Ene 26", perm_campo: 29442 },
  { p: "Feb 26", perm_campo: 29285 },
];
const IMSS_PT_PERM_URB = [
  { p: "Ene 16", perm_urb: 298434 },
  { p: "Feb 16", perm_urb: 300940 },
  { p: "Mar 16", perm_urb: 302634 },
  { p: "Abr 16", perm_urb: 304819 },
  { p: "May 16", perm_urb: 305896 },
  { p: "Jun 16", perm_urb: 307995 },
  { p: "Jul 16", perm_urb: 307298 },
  { p: "Ago 16", perm_urb: 309012 },
  { p: "Sep 16", perm_urb: 311412 },
  { p: "Oct 16", perm_urb: 313125 },
  { p: "Nov 16", perm_urb: 316124 },
  { p: "Dic 16", perm_urb: 314405 },
  { p: "Ene 17", perm_urb: 312744 },
  { p: "Feb 17", perm_urb: 314670 },
  { p: "Mar 17", perm_urb: 317460 },
  { p: "Abr 17", perm_urb: 319784 },
  { p: "May 17", perm_urb: 320212 },
  { p: "Jun 17", perm_urb: 322650 },
  { p: "Jul 17", perm_urb: 321978 },
  { p: "Ago 17", perm_urb: 322986 },
  { p: "Sep 17", perm_urb: 325371 },
  { p: "Oct 17", perm_urb: 328034 },
  { p: "Nov 17", perm_urb: 329255 },
  { p: "Dic 17", perm_urb: 328316 },
  { p: "Ene 18", perm_urb: 327671 },
  { p: "Feb 18", perm_urb: 330615 },
  { p: "Mar 18", perm_urb: 331603 },
  { p: "Abr 18", perm_urb: 332273 },
  { p: "May 18", perm_urb: 332084 },
  { p: "Jun 18", perm_urb: 333682 },
  { p: "Jul 18", perm_urb: 332849 },
  { p: "Ago 18", perm_urb: 333278 },
  { p: "Sep 18", perm_urb: 334901 },
  { p: "Oct 18", perm_urb: 337294 },
  { p: "Nov 18", perm_urb: 339032 },
  { p: "Dic 18", perm_urb: 337334 },
  { p: "Ene 19", perm_urb: 336404 },
  { p: "Feb 19", perm_urb: 338432 },
  { p: "Mar 19", perm_urb: 339271 },
  { p: "Abr 19", perm_urb: 338972 },
  { p: "May 19", perm_urb: 339269 },
  { p: "Jun 19", perm_urb: 338544 },
  { p: "Jul 19", perm_urb: 337858 },
  { p: "Ago 19", perm_urb: 339383 },
  { p: "Sep 19", perm_urb: 339960 },
  { p: "Oct 19", perm_urb: 343377 },
  { p: "Nov 19", perm_urb: 345914 },
  { p: "Dic 19", perm_urb: 343048 },
  { p: "Ene 20", perm_urb: 342045 },
  { p: "Feb 20", perm_urb: 345259 },
  { p: "Mar 20", perm_urb: 345102 },
  { p: "Abr 20", perm_urb: 342223 },
  { p: "May 20", perm_urb: 338765 },
  { p: "Jun 20", perm_urb: 336794 },
  { p: "Jul 20", perm_urb: 335977 },
  { p: "Ago 20", perm_urb: 336852 },
  { p: "Sep 20", perm_urb: 337668 },
  { p: "Oct 20", perm_urb: 338569 },
  { p: "Nov 20", perm_urb: 340171 },
  { p: "Dic 20", perm_urb: 339352 },
  { p: "Ene 21", perm_urb: 337418 },
  { p: "Feb 21", perm_urb: 339088 },
  { p: "Mar 21", perm_urb: 339079 },
  { p: "Abr 21", perm_urb: 339772 },
  { p: "May 21", perm_urb: 340022 },
  { p: "Jun 21", perm_urb: 340881 },
  { p: "Jul 21", perm_urb: 348007 },
  { p: "Ago 21", perm_urb: 348693 },
  { p: "Sep 21", perm_urb: 349883 },
  { p: "Oct 21", perm_urb: 350213 },
  { p: "Nov 21", perm_urb: 351667 },
  { p: "Dic 21", perm_urb: 349837 },
  { p: "Ene 22", perm_urb: 349009 },
  { p: "Feb 22", perm_urb: 350237 },
  { p: "Mar 22", perm_urb: 351193 },
  { p: "Abr 22", perm_urb: 351568 },
  { p: "May 22", perm_urb: 353003 },
  { p: "Jun 22", perm_urb: 353149 },
  { p: "Jul 22", perm_urb: 352519 },
  { p: "Ago 22", perm_urb: 354668 },
  { p: "Sep 22", perm_urb: 355698 },
  { p: "Oct 22", perm_urb: 358531 },
  { p: "Nov 22", perm_urb: 360172 },
  { p: "Dic 22", perm_urb: 358242 },
  { p: "Ene 23", perm_urb: 357412 },
  { p: "Feb 23", perm_urb: 359613 },
  { p: "Mar 23", perm_urb: 362144 },
  { p: "Abr 23", perm_urb: 363114 },
  { p: "May 23", perm_urb: 364822 },
  { p: "Jun 23", perm_urb: 364905 },
  { p: "Jul 23", perm_urb: 363830 },
  { p: "Ago 23", perm_urb: 364966 },
  { p: "Sep 23", perm_urb: 366838 },
  { p: "Oct 23", perm_urb: 369597 },
  { p: "Nov 23", perm_urb: 371530 },
  { p: "Dic 23", perm_urb: 368634 },
  { p: "Ene 24", perm_urb: 368428 },
  { p: "Feb 24", perm_urb: 369680 },
  { p: "Mar 24", perm_urb: 370933 },
  { p: "Abr 24", perm_urb: 372473 },
  { p: "May 24", perm_urb: 373975 },
  { p: "Jun 24", perm_urb: 373421 },
  { p: "Jul 24", perm_urb: 372717 },
  { p: "Ago 24", perm_urb: 374544 },
  { p: "Sep 24", perm_urb: 375946 },
  { p: "Oct 24", perm_urb: 382363 },
  { p: "Nov 24", perm_urb: 383861 },
  { p: "Dic 24", perm_urb: 383635 },
  { p: "Ene 25", perm_urb: 382122 },
  { p: "Feb 25", perm_urb: 379934 },
  { p: "Mar 25", perm_urb: 381826 },
  { p: "Abr 25", perm_urb: 386357 },
  { p: "May 25", perm_urb: 388465 },
  { p: "Jun 25", perm_urb: 387697 },
  { p: "Jul 25", perm_urb: 388018 },
  { p: "Ago 25", perm_urb: 387105 },
  { p: "Sep 25", perm_urb: 392418 },
  { p: "Oct 25", perm_urb: 392716 },
  { p: "Nov 25", perm_urb: 389995 },
  { p: "Dic 25", perm_urb: 387406 },
  { p: "Ene 26", perm_urb: 388165 },
  { p: "Feb 26", perm_urb: 389065 },
];

// ─── SECTORES (ilustrativos) ─────────────────────────────────────────────────

// ════════════════════════════════════════════════════════════════════════════
//  DATOS ENOE — Sección 4.1 Trabajadores subordinados y remunerados
// ════════════════════════════════════════════════════════════════════════════

const ENOE_S41_GRANDES = [
  {
    p: "I 16",
    primario: 238190,
    secundario: 239127,
    terciario: 679298,
  },
  {
    p: "II 16",
    primario: 268196,
    secundario: 249909,
    terciario: 633653,
  },
  {
    p: "III 16",
    primario: 231184,
    secundario: 242542,
    terciario: 659751,
  },
  {
    p: "IV 16",
    primario: 238951,
    secundario: 241389,
    terciario: 668370,
  },
  {
    p: "I 17",
    primario: 229040,
    secundario: 236518,
    terciario: 715542,
  },
  {
    p: "II 17",
    primario: 236306,
    secundario: 243817,
    terciario: 666021,
  },
  {
    p: "III 17",
    primario: 240209,
    secundario: 252801,
    terciario: 669493,
  },
  {
    p: "IV 17",
    primario: 272652,
    secundario: 242474,
    terciario: 669950,
  },
  {
    p: "I 18",
    primario: 280958,
    secundario: 259010,
    terciario: 683147,
  },
  {
    p: "II 18",
    primario: 279107,
    secundario: 260500,
    terciario: 689437,
  },
  {
    p: "III 18",
    primario: 252834,
    secundario: 269141,
    terciario: 707679,
  },
  {
    p: "IV 18",
    primario: 259881,
    secundario: 237619,
    terciario: 738178,
  },
  {
    p: "I 19",
    primario: 305348,
    secundario: 260599,
    terciario: 743060,
  },
  {
    p: "II 19",
    primario: 319126,
    secundario: 305909,
    terciario: 703415,
  },
  {
    p: "III 19",
    primario: 281725,
    secundario: 326586,
    terciario: 691383,
  },
  {
    p: "IV 19",
    primario: 285098,
    secundario: 278285,
    terciario: 734854,
  },
  {
    p: "I 20",
    primario: 312006,
    secundario: 281189,
    terciario: 739443,
  },
  {
    p: "III 20",
    primario: 233856,
    secundario: 223935,
    terciario: 719936,
  },
  {
    p: "IV 20",
    primario: 223728,
    secundario: 258339,
    terciario: 794764,
  },
  {
    p: "I 21",
    primario: 348057,
    secundario: 295382,
    terciario: 677662,
  },
  {
    p: "II 21",
    primario: 286353,
    secundario: 286636,
    terciario: 766612,
  },
  {
    p: "III 21",
    primario: 286913,
    secundario: 278077,
    terciario: 819412,
  },
  {
    p: "IV 21",
    primario: 292964,
    secundario: 268411,
    terciario: 843815,
  },
  {
    p: "I 22",
    primario: 276128,
    secundario: 294091,
    terciario: 838655,
  },
  {
    p: "II 22",
    primario: 279570,
    secundario: 341006,
    terciario: 833229,
  },
  {
    p: "III 22",
    primario: 302224,
    secundario: 311911,
    terciario: 814493,
  },
  {
    p: "IV 22",
    primario: 300010,
    secundario: 322122,
    terciario: 793271,
  },
  {
    p: "I 23",
    primario: 339422,
    secundario: 287420,
    terciario: 819651,
  },
  {
    p: "II 23",
    primario: 317673,
    secundario: 315359,
    terciario: 807716,
  },
  {
    p: "III 23",
    primario: 333151,
    secundario: 317491,
    terciario: 855677,
  },
  {
    p: "IV 23",
    primario: 335521,
    secundario: 300450,
    terciario: 860188,
  },
  {
    p: "I 24",
    primario: 356478,
    secundario: 295583,
    terciario: 871669,
  },
  {
    p: "II 24",
    primario: 277285,
    secundario: 316590,
    terciario: 902902,
  },
  {
    p: "III 24",
    primario: 263967,
    secundario: 288172,
    terciario: 862081,
  },
  {
    p: "IV 24",
    primario: 252815,
    secundario: 300522,
    terciario: 892859,
  },
  {
    p: "I 25",
    primario: 299983,
    secundario: 314832,
    terciario: 888684,
  },
  {
    p: "II 25",
    primario: 248133,
    secundario: 335635,
    terciario: 900729,
  },
  {
    p: "III 25",
    primario: 259296,
    secundario: 336953,
    terciario: 914669,
  },
  {
    p: "IV 25",
    primario: 305777,
    secundario: 301930,
    terciario: 909301,
  },
];

const ENOE_S41_SUBSECTORES = [
  {
    p: "I 16",
    agric: 238190,
    ind_ext: 9494,
    manufactura: 145963,
    construccion: 83670,
    comercio: 181104,
    restaurantes: 51376,
    transportes: 54736,
    serv_prof: 52443,
    serv_soc: 142412,
    serv_div: 131118,
    gobierno: 66109,
  },
  {
    p: "II 16",
    agric: 268196,
    ind_ext: 10427,
    manufactura: 139054,
    construccion: 100428,
    comercio: 174058,
    restaurantes: 47196,
    transportes: 53541,
    serv_prof: 44148,
    serv_soc: 124645,
    serv_div: 131220,
    gobierno: 58845,
  },
  {
    p: "III 16",
    agric: 231184,
    ind_ext: 8603,
    manufactura: 138035,
    construccion: 95904,
    comercio: 170470,
    restaurantes: 57577,
    transportes: 51646,
    serv_prof: 50583,
    serv_soc: 123861,
    serv_div: 138226,
    gobierno: 67388,
  },
  {
    p: "IV 16",
    agric: 238951,
    ind_ext: 9510,
    manufactura: 128849,
    construccion: 103030,
    comercio: 183601,
    restaurantes: 55874,
    transportes: 49056,
    serv_prof: 45620,
    serv_soc: 122218,
    serv_div: 144437,
    gobierno: 67564,
  },
  {
    p: "I 17",
    agric: 229040,
    ind_ext: 5226,
    manufactura: 130114,
    construccion: 101178,
    comercio: 189581,
    restaurantes: 69212,
    transportes: 51155,
    serv_prof: 47654,
    serv_soc: 138058,
    serv_div: 150669,
    gobierno: 69213,
  },
  {
    p: "II 17",
    agric: 236306,
    ind_ext: 5766,
    manufactura: 138409,
    construccion: 99642,
    comercio: 166882,
    restaurantes: 70845,
    transportes: 45523,
    serv_prof: 43617,
    serv_soc: 136545,
    serv_div: 144392,
    gobierno: 58217,
  },
  {
    p: "III 17",
    agric: 240209,
    ind_ext: 2881,
    manufactura: 129516,
    construccion: 120404,
    comercio: 183523,
    restaurantes: 61049,
    transportes: 40127,
    serv_prof: 50223,
    serv_soc: 143067,
    serv_div: 131635,
    gobierno: 59869,
  },
  {
    p: "IV 17",
    agric: 272652,
    ind_ext: 4457,
    manufactura: 139952,
    construccion: 98065,
    comercio: 173925,
    restaurantes: 57947,
    transportes: 42828,
    serv_prof: 47723,
    serv_soc: 145729,
    serv_div: 137974,
    gobierno: 63824,
  },
  {
    p: "I 18",
    agric: 280958,
    ind_ext: 6540,
    manufactura: 144373,
    construccion: 108097,
    comercio: 190399,
    restaurantes: 68120,
    transportes: 50218,
    serv_prof: 48150,
    serv_soc: 142687,
    serv_div: 118578,
    gobierno: 64995,
  },
  {
    p: "II 18",
    agric: 279107,
    ind_ext: 6878,
    manufactura: 138199,
    construccion: 115423,
    comercio: 201971,
    restaurantes: 46939,
    transportes: 56893,
    serv_prof: 51403,
    serv_soc: 148501,
    serv_div: 118649,
    gobierno: 65081,
  },
  {
    p: "III 18",
    agric: 252834,
    ind_ext: 5544,
    manufactura: 133004,
    construccion: 130593,
    comercio: 192063,
    restaurantes: 60837,
    transportes: 55210,
    serv_prof: 48028,
    serv_soc: 152802,
    serv_div: 130350,
    gobierno: 68389,
  },
  {
    p: "IV 18",
    agric: 259881,
    ind_ext: 4008,
    manufactura: 122373,
    construccion: 111238,
    comercio: 209761,
    restaurantes: 63658,
    transportes: 54351,
    serv_prof: 47918,
    serv_soc: 142940,
    serv_div: 146493,
    gobierno: 73057,
  },
  {
    p: "I 19",
    agric: 305348,
    ind_ext: 4900,
    manufactura: 143361,
    construccion: 112338,
    comercio: 218063,
    restaurantes: 66965,
    transportes: 50308,
    serv_prof: 49633,
    serv_soc: 142705,
    serv_div: 150620,
    gobierno: 64766,
  },
  {
    p: "II 19",
    agric: 319126,
    ind_ext: 5837,
    manufactura: 170600,
    construccion: 129472,
    comercio: 204066,
    restaurantes: 56520,
    transportes: 40925,
    serv_prof: 43033,
    serv_soc: 139232,
    serv_div: 150760,
    gobierno: 68879,
  },
  {
    p: "III 19",
    agric: 281725,
    ind_ext: 8599,
    manufactura: 180218,
    construccion: 137769,
    comercio: 182102,
    restaurantes: 63142,
    transportes: 46404,
    serv_prof: 51413,
    serv_soc: 145864,
    serv_div: 127758,
    gobierno: 74700,
  },
  {
    p: "IV 19",
    agric: 285098,
    ind_ext: 7740,
    manufactura: 139641,
    construccion: 130904,
    comercio: 204803,
    restaurantes: 58839,
    transportes: 52741,
    serv_prof: 49159,
    serv_soc: 153433,
    serv_div: 138620,
    gobierno: 77259,
  },
  {
    p: "I 20",
    agric: 312006,
    ind_ext: 9056,
    manufactura: 149986,
    construccion: 122147,
    comercio: 205731,
    restaurantes: 63765,
    transportes: 47705,
    serv_prof: 58656,
    serv_soc: 155373,
    serv_div: 125843,
    gobierno: 82370,
  },
  {
    p: "III 20",
    agric: 233856,
    ind_ext: 7023,
    manufactura: 112185,
    construccion: 104727,
    comercio: 198214,
    restaurantes: 53546,
    transportes: 54580,
    serv_prof: 49484,
    serv_soc: 171413,
    serv_div: 117817,
    gobierno: 74882,
  },
  {
    p: "IV 20",
    agric: 223728,
    ind_ext: 10177,
    manufactura: 115362,
    construccion: 132800,
    comercio: 241143,
    restaurantes: 61168,
    transportes: 75017,
    serv_prof: 49264,
    serv_soc: 141853,
    serv_div: 145243,
    gobierno: 81076,
  },
  {
    p: "I 21",
    agric: 348057,
    ind_ext: 7495,
    manufactura: 170402,
    construccion: 117485,
    comercio: 198304,
    restaurantes: 53439,
    transportes: 39575,
    serv_prof: 52728,
    serv_soc: 134182,
    serv_div: 132215,
    gobierno: 67219,
  },
  {
    p: "II 21",
    agric: 286353,
    ind_ext: 3142,
    manufactura: 162208,
    construccion: 121286,
    comercio: 210136,
    restaurantes: 58118,
    transportes: 72938,
    serv_prof: 60843,
    serv_soc: 145690,
    serv_div: 142555,
    gobierno: 76332,
  },
  {
    p: "III 21",
    agric: 286913,
    ind_ext: 17898,
    manufactura: 123245,
    construccion: 136934,
    comercio: 203831,
    restaurantes: 61845,
    transportes: 68418,
    serv_prof: 79442,
    serv_soc: 179195,
    serv_div: 133460,
    gobierno: 93221,
  },
  {
    p: "IV 21",
    agric: 292964,
    ind_ext: 18272,
    manufactura: 117138,
    construccion: 133001,
    comercio: 212709,
    restaurantes: 73527,
    transportes: 64077,
    serv_prof: 76459,
    serv_soc: 173318,
    serv_div: 159293,
    gobierno: 84432,
  },
  {
    p: "I 22",
    agric: 276128,
    ind_ext: 11410,
    manufactura: 144376,
    construccion: 138305,
    comercio: 248080,
    restaurantes: 58007,
    transportes: 59912,
    serv_prof: 69159,
    serv_soc: 180138,
    serv_div: 147574,
    gobierno: 75785,
  },
  {
    p: "II 22",
    agric: 279570,
    ind_ext: 12996,
    manufactura: 176355,
    construccion: 151655,
    comercio: 236322,
    restaurantes: 75335,
    transportes: 54100,
    serv_prof: 66455,
    serv_soc: 163237,
    serv_div: 156187,
    gobierno: 81593,
  },
  {
    p: "III 22",
    agric: 302224,
    ind_ext: 11567,
    manufactura: 164227,
    construccion: 136117,
    comercio: 253011,
    restaurantes: 72430,
    transportes: 63930,
    serv_prof: 60468,
    serv_soc: 155197,
    serv_div: 137968,
    gobierno: 71489,
  },
  {
    p: "IV 22",
    agric: 300010,
    ind_ext: 12462,
    manufactura: 163884,
    construccion: 145776,
    comercio: 232792,
    restaurantes: 71868,
    transportes: 62995,
    serv_prof: 57722,
    serv_soc: 148645,
    serv_div: 144531,
    gobierno: 74718,
  },
  {
    p: "I 23",
    agric: 339422,
    ind_ext: 8380,
    manufactura: 145034,
    construccion: 134006,
    comercio: 246100,
    restaurantes: 92438,
    transportes: 64165,
    serv_prof: 58537,
    serv_soc: 135945,
    serv_div: 148285,
    gobierno: 74181,
  },
  {
    p: "II 23",
    agric: 317673,
    ind_ext: 6565,
    manufactura: 164639,
    construccion: 144155,
    comercio: 233510,
    restaurantes: 88774,
    transportes: 60640,
    serv_prof: 77868,
    serv_soc: 136923,
    serv_div: 141773,
    gobierno: 68228,
  },
  {
    p: "III 23",
    agric: 333151,
    ind_ext: 9558,
    manufactura: 176106,
    construccion: 131827,
    comercio: 222177,
    restaurantes: 99710,
    transportes: 65456,
    serv_prof: 82169,
    serv_soc: 149381,
    serv_div: 155226,
    gobierno: 81558,
  },
  {
    p: "IV 23",
    agric: 335521,
    ind_ext: 8792,
    manufactura: 152201,
    construccion: 139457,
    comercio: 244314,
    restaurantes: 95402,
    transportes: 58597,
    serv_prof: 78653,
    serv_soc: 125727,
    serv_div: 154007,
    gobierno: 103488,
  },
  {
    p: "I 24",
    agric: 356478,
    ind_ext: 9293,
    manufactura: 164918,
    construccion: 121372,
    comercio: 249884,
    restaurantes: 104620,
    transportes: 61568,
    serv_prof: 82864,
    serv_soc: 131189,
    serv_div: 149758,
    gobierno: 91786,
  },
  {
    p: "II 24",
    agric: 277285,
    ind_ext: 5633,
    manufactura: 192072,
    construccion: 118885,
    comercio: 262730,
    restaurantes: 105936,
    transportes: 66047,
    serv_prof: 80476,
    serv_soc: 141160,
    serv_div: 148613,
    gobierno: 97940,
  },
  {
    p: "III 24",
    agric: 263967,
    ind_ext: 10229,
    manufactura: 159092,
    construccion: 118851,
    comercio: 252804,
    restaurantes: 97243,
    transportes: 60279,
    serv_prof: 90896,
    serv_soc: 149463,
    serv_div: 122933,
    gobierno: 88463,
  },
  {
    p: "IV 24",
    agric: 252815,
    ind_ext: 5431,
    manufactura: 174759,
    construccion: 120332,
    comercio: 264486,
    restaurantes: 104491,
    transportes: 49872,
    serv_prof: 79594,
    serv_soc: 160330,
    serv_div: 146830,
    gobierno: 87256,
  },
  {
    p: "I 25",
    agric: 299983,
    ind_ext: 5425,
    manufactura: 171228,
    construccion: 138179,
    comercio: 280180,
    restaurantes: 112643,
    transportes: 59199,
    serv_prof: 71340,
    serv_soc: 163417,
    serv_div: 122501,
    gobierno: 79404,
  },
  {
    p: "II 25",
    agric: 248133,
    ind_ext: 5583,
    manufactura: 176828,
    construccion: 153224,
    comercio: 273470,
    restaurantes: 97480,
    transportes: 51223,
    serv_prof: 77429,
    serv_soc: 160264,
    serv_div: 156461,
    gobierno: 84402,
  },
  {
    p: "III 25",
    agric: 259296,
    ind_ext: 6009,
    manufactura: 171962,
    construccion: 158982,
    comercio: 309448,
    restaurantes: 86476,
    transportes: 47486,
    serv_prof: 60774,
    serv_soc: 168122,
    serv_div: 169501,
    gobierno: 72862,
  },
  {
    p: "IV 25",
    agric: 305777,
    ind_ext: 5280,
    manufactura: 146196,
    construccion: 150454,
    comercio: 282234,
    restaurantes: 94559,
    transportes: 54694,
    serv_prof: 69491,
    serv_soc: 158211,
    serv_div: 167248,
    gobierno: 82864,
  },
];

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 3 · DATOS — IMSS SECTORIAL · Punto en el tiempo (Enero 2026)
// ────────────────────────────────────────────────────────────────────────────
//  IMSS_SECTORES_ENE26  →  10 subsectores económicos (snapshot mensual)
//  IMSS_GRANDES_ENE26   →  3 grandes sectores: primario / secundario / terciario
//  ⚠️  Para actualizar: reemplaza el objeto completo con el nuevo período.
// ════════════════════════════════════════════════════════════════════════════
const IMSS_SECTORES_ENE26 = [
  {
    p: "Feb 26",
    agric: 60013,
    ind_ext: 1582,
    transf_1: 54286,
    transf_2: 27675,
    construccion: 32701,
    electrica: 5490,
    comercio: 124061,
    transportes: 28141,
    serv_empresas: 65004,
    serv_soc: 102449,
  },
];

const IMSS_GRANDES_ENE26 = [
  { p: "Feb 26", primario: 60013, secundario: 121734, terciario: 319655 },
];

// Top 10 municipios por empleo formal — Febrero 2026 (SBC = Salario Base de Cotización)
const IMSS_TOP10_MUN = [
  { municipio: "Morelia",          empleo: 196514, sbc: 589.85 },
  { municipio: "Uruapan",          empleo:  58570, sbc: 503.75 },
  { municipio: "Zamora",           empleo:  39898, sbc: 500.48 },
  { municipio: "Lázaro Cárdenas", empleo:  38117, sbc: 747.17 },
  { municipio: "La Piedad",        empleo:  13732, sbc: 559.57 },
  { municipio: "Jacona",           empleo:  12564, sbc: 495.37 },
  { municipio: "Tarímbaro",        empleo:  11921, sbc: 474.50 },
  { municipio: "Los Reyes",        empleo:  11255, sbc: 458.26 },
  { municipio: "Zitácuaro",        empleo:  10063, sbc: 527.80 },
  { municipio: "Tangancícuaro",    empleo:   7951, sbc: 417.24 },
];

const SEC_E = [
  { s: "Servicios", v: 38.2, c: "#6B1737" },
  { s: "Comercio", v: 20.1, c: "#8C2249" },
  { s: "Agropecuario", v: 18.4, c: "#B03560" },
  { s: "Manufactura", v: 11.8, c: "#C8427A" },
  { s: "Construcción", v: 7.3, c: "#D96E9A" },
  { s: "Transporte", v: 2.5, c: "#E8A0BC" },
  { s: "Gobierno", v: 1.7, c: "#F2C8DA" },
];
const SEC_I = [
  { s: "Servicios", v: 37.5, c: "#6B1737" },
  { s: "Comercio", v: 24.1, c: "#8C2249" },
  { s: "Manufactura", v: 18.9, c: "#B03560" },
  { s: "Construcción", v: 11.2, c: "#C8427A" },
  { s: "Agropecuario", v: 8.3, c: "#D96E9A" },
];

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 4 · UTILIDADES — funciones de formato, merge y tooltip base
// ────────────────────────────────────────────────────────────────────────────
//  mergeByPeriod(...arrays)  →  une múltiples arrays por el campo "p" (período)
//  fmtM(v)     →  formatea a millones: 2,200,000 → "2.20M"
//  fmtN(v)     →  número entero con separador de miles: 483000 → "483,000"
//  fmtMil(v)   →  número en miles con sufijo: 483000 → "483 mil"
//  avg(arr,key)→  promedio de un campo en un array
//  xTickYear   →  muestra solo el año en trimestre I del eje X
//  axTick      →  estilos base para ticks de ejes
//  legFmt      →  estilos base para leyenda
//  fmtPeriod   →  convierte período a texto: "I 25" → "Trimestre 1 · 2025"
//  BaseTooltip →  ⚠️  componente único de tooltip — editar aquí para cambiar
//                  el estilo visual de todos los tooltips de la app
// ════════════════════════════════════════════════════════════════════════════
function mergeByPeriod(...arrays) {
  const map = {};
  arrays.forEach((arr) =>
    arr.forEach((row) => {
      if (!map[row.p]) map[row.p] = { p: row.p };
      Object.assign(map[row.p], row);
    }),
  );
  return Object.values(map);
}

// ⚠️  Funciones de formato de números — editar aquí para cambiar la presentación
const fmtM = (v) => `${(v / 1e6).toFixed(2)}M`; // 2,200,000 → "2.20M"
const fmtN = (v) => (v != null ? Math.round(v).toLocaleString("es-MX") : ""); // 483000 → "483,000"
const fmtMil = (v) =>
  v != null ? `${Math.round(v / 1000).toLocaleString("es-MX")} mil` : ""; // 483000 → "483 mil"
const avg = (arr, key) => {
  const v = arr.map((d) => d[key]).filter((x) => x != null);
  return v.reduce((a, b) => a + b, 0) / v.length;
};

// Mostrar año en eje X solo cuando cambia (trimestre I)
const xTickYear = (value) => {
  if (!value) return "";
  const [trim, yr] = value.split(" ");
  return trim === "I" ? `20${yr}` : "";
};

const axTick = (extra = {}) => ({
  fontFamily: FONT,
  fontSize: 8,
  fill: MX.grayMid,
  ...extra,
});
const legFmt = (v) => (
  <span style={{ fontFamily: FONT, fontSize: 10, color: MX.grayDark }}>
    {v}
  </span>
);

// ─── FORMATO DE PERÍODO Y TOOLTIP BASE ──────────────────────────────────────
const fmtPeriod = (p) => {
  if (!p) return p;
  const trimMap = { I: 1, II: 2, III: 3, IV: 4 };
  const mesMap = {
    Ene: "Enero",
    Feb: "Febrero",
    Mar: "Marzo",
    Abr: "Abril",
    May: "Mayo",
    Jun: "Junio",
    Jul: "Julio",
    Ago: "Agosto",
    Sep: "Septiembre",
    Oct: "Octubre",
    Nov: "Noviembre",
    Dic: "Diciembre",
  };
  const parts = p.split(" ");
  if (parts.length === 2) {
    const [a, b] = parts;
    if (trimMap[a] !== undefined) return `Trimestre ${trimMap[a]} · 20${b}`;
    if (mesMap[a] !== undefined) return `${mesMap[a]} 20${b}`;
  }
  return p;
};

function BaseTooltip({ label, rows, rawLabel = false }) {
  return (
    <div
      style={{
        fontFamily: FONT,
        background: MX.white,
        border: `1px solid ${MX.border}`,
        borderRadius: 8,
        padding: "8px 12px",
        boxShadow: "0 4px 14px rgba(107,23,55,0.10)",
        fontSize: 10,
        maxWidth: 220,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: MX.vino,
          marginBottom: 5,
          fontSize: 10,
        }}
      >
        {rawLabel ? label : fmtPeriod(label)}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            marginBottom: i < rows.length - 1 ? 2 : 0,
            borderTop: r.sep ? `1px solid ${MX.border}` : "none",
            paddingTop: r.sep ? 5 : 0,
            marginTop: r.sep ? 3 : 0,
          }}
        >
          <span style={{ color: MX.grayMid }}>{r.name}: </span>
          <b style={{ color: r.color || MX.grayDark }}>{r.value}</b>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 5 · COMPONENTES BASE — reutilizables en todos los tabs
// ────────────────────────────────────────────────────────────────────────────
//  AnimNum    →  número animado con easing al montar  (fmt: "pct", "$", "k", "M")
//  KpiCard    →  tarjeta de indicador clave  ⚠️  color, delta y nota configurables
//  Pills      →  botones de selección tipo pastilla (activo: vino, inactivo: borde)
//  Section    →  contenedor de sección con barra lateral vino + pills opcionales
//  Card       →  contenedor blanco con sombra para gráficas
//  PieLabel   →  etiqueta externa del pie chart (oculta si slice < 4%)
// ════════════════════════════════════════════════════════════════════════════

// Número animado
function AnimNum({ target, fmt }) {
  const [n, setN] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let s = null;
    const run = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 900, 1);
      setN((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  if (fmt === "pct") return <>{n.toFixed(1)}%</>;
  if (fmt === "$") return <>${Math.round(n).toLocaleString("es-MX")}</>;
  if (fmt === "k") return <>{(n / 1000).toFixed(0)} k</>;
  if (fmt === "M") return <>{(n / 1e6).toFixed(2)} M</>;
  return <>{Math.round(n).toLocaleString("es-MX")}</>;
}

// KPI Card — responsiva
function KpiCard({
  label,
  valor,
  fmt,
  nacStr,
  delta,
  dDir,
  nota,
  color,
  isMobile,
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: FONT,
        background: MX.white,
        border: `1px solid ${MX.border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 10,
        padding: isMobile ? "12px 10px" : "18px 20px",
        flex: 1,
        minWidth: 0,
        boxShadow: hov
          ? "0 8px 24px rgba(107,23,55,0.13)"
          : "0 2px 8px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all .18s ease",
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 8 : 9,
          fontWeight: 700,
          letterSpacing: isMobile ? 1 : 2,
          color: MX.grayMid,
          textTransform: "uppercase",
          marginBottom: isMobile ? 5 : 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: isMobile ? 22 : 32,
          fontWeight: 700,
          color,
          lineHeight: 1,
          marginBottom: isMobile ? 5 : 8,
        }}
      >
        <AnimNum target={valor} fmt={fmt} />
      </div>
      {nacStr && (
        <div
          style={{
            fontSize: isMobile ? 9 : 10,
            color: MX.grayMid,
            marginBottom: 3,
          }}
        >
          Nacional: <b style={{ color: MX.grayDark }}>{nacStr}</b>
        </div>
      )}
      {delta && (
        <div
          style={{
            fontSize: isMobile ? 9 : 10,
            fontWeight: 700,
            color: dDir === "pos" ? MX.green : "#C0392B",
            marginBottom: 3,
          }}
        >
          {dDir === "pos" ? "▲" : "▼"} {delta} vs año anterior
        </div>
      )}
      <div style={{ fontSize: 9, color: MX.grayMid, lineHeight: 1.4 }}>
        {nota}
      </div>
    </div>
  );
}

// Pill buttons — responsivos
function Pills({ options, active, onChange, isMobile }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            fontFamily: FONT,
            fontSize: isMobile ? 10 : 11,
            fontWeight: 600,
            cursor: "pointer",
            padding: isMobile ? "4px 12px" : "5px 16px",
            borderRadius: 20,
            transition: "all .15s",
            background: active === o.id ? MX.vino : "transparent",
            color: active === o.id ? MX.white : MX.vino,
            border: `1.5px solid ${MX.vino}`,
            whiteSpace: "nowrap",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Sección con título + pills — responsiva
function Section({
  title,
  sub,
  options,
  active,
  onChange,
  children,
  isMobile,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 10 : 14,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 4,
              height: 22,
              background: MX.vino,
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONT,
              fontSize: isMobile ? 12 : 13,
              fontWeight: 700,
              color: MX.vinoDark,
            }}
          >
            {title}
          </span>
          {sub && (
            <span
              style={{
                fontFamily: FONT,
                fontSize: 9,
                color: MX.grayMid,
                background: MX.crema,
                border: `1px solid ${MX.border}`,
                borderRadius: 20,
                padding: "2px 10px",
              }}
            >
              {sub}
            </span>
          )}
        </div>
        {options && (
          <div
            style={{
              paddingLeft: isMobile ? 14 : 0,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            <Pills
              options={options}
              active={active}
              onChange={onChange}
              isMobile={isMobile}
            />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// Card contenedor de gráfica — responsiva
function Card({ title, children, style, isMobile }) {
  return (
    <div
      style={{
        background: MX.white,
        border: `1px solid ${MX.border}`,
        borderRadius: 10,
        padding: isMobile ? "14px 12px" : "18px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: FONT,
            fontSize: isMobile ? 10 : 11,
            fontWeight: 700,
            color: MX.vino,
            marginBottom: 12,
            lineHeight: 1.4,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// Etiqueta pie
const PieLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
  const R = Math.PI / 180,
    r = outerRadius + 18;
  const x = cx + r * Math.cos(-midAngle * R),
    y = cy + r * Math.sin(-midAngle * R);
  if (value < 4) return null;
  return (
    <text
      x={x}
      y={y}
      fill={MX.grayDark}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={9}
      fontFamily={FONT}
      fontWeight={600}
    >
      {value}%
    </text>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 6 · GRÁFICAS ENOE
// ════════════════════════════════════════════════════════════════════════════

// ── GRÁFICA A · GrafPEAOcupados ──────────────────────────────────────────────
//  Tipo: ComposedChart (Area + Line)  |  Datos: ENOE_PEA + ENOE_OCUP + ENOE_DESOC_ABS
//  Muestra la brecha entre PEA y población ocupada trimestre a trimestre.
//  ⚠️  Altura: isMobile ? 200 : 230  |  Dominio YAxis: [1700000, 2450000]
function GrafPEAOcupados({ isMobile }) {
  const data = mergeByPeriod(ENOE_PEA, ENOE_OCUP, ENOE_DESOC_ABS);

  const TooltipPEA = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = data.find((d) => d.p === label) || {};
    return (
      <BaseTooltip
        label={label}
        rows={[
          { name: "PEA", value: fmtN(row.pea), color: MX.vino },
          { name: "Ocupados", value: fmtN(row.ocup), color: MX.rosa },
          {
            name: "Sin empleo",
            value: fmtN(row.desoc_abs),
            color: MX.vinoMid,
            sep: true,
          },
        ]}
      />
    );
  };

  return (
    <Card
      title="PEA vs Población Ocupada — Michoacán"
      isMobile={isMobile}
      style={{ width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 230}>
        <ComposedChart
          data={data}
          margin={{
            left: isMobile ? 4 : 14,
            right: isMobile ? 4 : 14,
            top: 10,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="grdRosa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MX.rosa} stopOpacity={0.22} />
              <stop offset="100%" stopColor={MX.rosa} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="grdVino" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MX.vino} stopOpacity={0.07} />
              <stop offset="100%" stopColor={MX.vino} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" />
          <XAxis
            dataKey="p"
            tick={axTick({ fontSize: isMobile ? 7 : 8 })}
            axisLine={false}
            tickLine={false}
            tickFormatter={xTickYear}
            interval={0}
          />
          <YAxis
            tick={axTick({ fontSize: isMobile ? 7 : 8 })}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtM}
            domain={[1700000, 2450000]}
            width={isMobile ? 36 : 46}
          />
          <Tooltip content={<TooltipPEA />} />
          <Legend
            iconType="circle"
            iconSize={7}
            formatter={legFmt}
            payload={[
              { value: "PEA", type: "circle", color: MX.vino },
              { value: "Población Ocupada", type: "circle", color: MX.rosa },
            ]}
          />
          <Area
            type="monotone"
            dataKey="pea"
            fill="url(#grdVino)"
            stroke="none"
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="ocup"
            fill="url(#grdRosa)"
            stroke="none"
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="pea"
            name="PEA"
            stroke={MX.vino}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: MX.vino,
              stroke: MX.white,
              strokeWidth: 2,
            }}
          />
          <Line
            type="monotone"
            dataKey="ocup"
            name="Población Ocupada"
            stroke={MX.rosa}
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{
              r: 5,
              fill: MX.rosa,
              stroke: MX.white,
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── GRÁFICA B · GrafTasas ────────────────────────────────────────────────────
//  Tipo: ComposedChart (Area + Line, doble eje Y)
//  Datos: ENOE_PART (eje izq, 50–65%) + ENOE_DESOC (eje der, 0–5%)
//  Incluye línea de referencia punteada = promedio del período.
//  ⚠️  Dominio YAxis L: [50, 65]  |  Dominio YAxis R: [0, 5]
function GrafTasas({ isMobile }) {
  const data = mergeByPeriod(ENOE_PART, ENOE_DESOC);
  const mediaPartic = avg(data, "part");
  const mediaDesoc = avg(data, "desoc");

  const TooltipTasas = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const seen = new Set();
    const rows = payload
      .filter((p) => {
        const dup = seen.has(p.dataKey);
        seen.add(p.dataKey);
        return !dup;
      })
      .map((p) => ({
        name: p.name,
        value: `${Number(p.value).toFixed(2)}%`,
        color: p.color,
      }));
    return <BaseTooltip label={label} rows={rows} />;
  };

  return (
    <Card
      title="Tasa de Participación y Tasa de Desocupación (%)"
      isMobile={isMobile}
      style={{ width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 230}>
        <ComposedChart
          data={data}
          margin={{
            left: isMobile ? 4 : 14,
            right: isMobile ? 28 : 34,
            top: 5,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="grdTasaVino" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MX.vino} stopOpacity={0.07} />
              <stop offset="100%" stopColor={MX.vino} stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="grdTasaRosa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MX.rosa} stopOpacity={0.25} />
              <stop offset="100%" stopColor={MX.rosa} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" />
          <XAxis
            dataKey="p"
            tick={axTick({ fontSize: isMobile ? 7 : 8 })}
            axisLine={false}
            tickLine={false}
            tickFormatter={xTickYear}
            interval={0}
          />
          <YAxis
            yAxisId="L"
            tick={axTick({ fontSize: isMobile ? 7 : 8 })}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            domain={[50, 65]}
            width={isMobile ? 26 : 36}
          />
          <YAxis
            yAxisId="R"
            orientation="right"
            tick={axTick({ fontSize: isMobile ? 7 : 8 })}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            domain={[0, 5]}
            width={isMobile ? 24 : 30}
          />
          <Tooltip content={<TooltipTasas />} />
          <Legend
            iconType="circle"
            iconSize={7}
            formatter={legFmt}
            payload={[
              { value: "T. Participación", type: "circle", color: MX.vino },
              { value: "T. Desocupación", type: "circle", color: MX.rosa },
            ]}
          />
          <ReferenceLine
            yAxisId="L"
            y={mediaPartic}
            stroke={MX.vino}
            strokeDasharray="4 3"
            strokeOpacity={0.35}
          />
          <ReferenceLine
            yAxisId="R"
            y={mediaDesoc}
            stroke={MX.rosa}
            strokeDasharray="4 3"
            strokeOpacity={0.35}
          />
          <Area
            yAxisId="L"
            type="monotone"
            dataKey="part"
            fill="url(#grdTasaVino)"
            stroke="none"
            legendType="none"
          />
          <Area
            yAxisId="R"
            type="monotone"
            dataKey="desoc"
            fill="url(#grdTasaRosa)"
            stroke="none"
            legendType="none"
          />
          <Line
            yAxisId="L"
            type="monotone"
            dataKey="part"
            name="T. Participación"
            stroke={MX.vino}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: MX.vino,
              stroke: MX.white,
              strokeWidth: 2,
            }}
          />
          <Line
            yAxisId="R"
            type="monotone"
            dataKey="desoc"
            name="T. Desocupación"
            stroke={MX.rosa}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: MX.rosa,
              stroke: MX.white,
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── GRÁFICA C · GrafSubsectores ──────────────────────────────────────────────
//  Tipo: BarChart horizontal (layout="vertical")
//  Datos: ENOE_S32_SUBSECTORES  |  Selector: trimestre + año
//  ⚠️  ETIQ     →  nombres completos para desktop  (editar aquí)
//  ⚠️  ETIQ_MOB →  nombres cortos para mobile      (editar aquí)
//  ⚠️  barColor →  colores por ranking: top 3 = vino, 4–7 = rosa, resto = neutral
//  ⚠️  chartH   →  altura: mobile 340 / desktop 360
//  ⚠️  yAxisW   →  ancho del eje Y: mobile 108 / desktop 205
//  Formato de valores: "483 mil"  |  Margen izq: 0  |  Margen der: mobile 58 / desktop 72
// ⚠️  ETIQ — nombres completos de subsectores ENOE para desktop
//  Editar aquí para cambiar las etiquetas del eje Y en barras horizontales
const ETIQ = {
  agric: "Agricultura, Ganadería y Silvicultura",
  manufactura: "Industria Manufacturera",
  construccion: "Industria de la Construcción",
  ind_ext: "Ind. Extractiva y Electricidad",
  comercio: "Comercio",
  restaurantes: "Restaurantes y Alojamiento",
  transportes: "Transportes y Comunicaciones",
  serv_prof: "Servicios Profesionales y Financieros",
  serv_soc: "Servicios Sociales",
  serv_div: "Servicios Diversos",
  gobierno: "Gobierno y Organismos Int.",
};

function GrafSubsectores({ isMobile }) {
  const periodos = ENOE_S32_SUBSECTORES.map((d) => d.p);

  // Extraer años y trimestres únicos
  const años = [...new Set(periodos.map((p) => p.split(" ")[1]))];
  const trimestres = ["I", "II", "III", "IV"];

  const lastP = periodos[periodos.length - 1].split(" ");
  const [trim, setTrim] = useState(lastP[0]);
  const [anio, setAnio] = useState(lastP[1]);

  // Ajustar si la combinación no existe
  const perKey = `${trim} ${anio}`;
  const periodoValido = periodos.includes(perKey)
    ? perKey
    : periodos[periodos.length - 1];

  // ⚠️  ETIQ_MOB — nombres cortos para mobile (≤430px)
  //  Editar aquí para cambiar etiquetas en vista móvil
  const ETIQ_MOB = {
    agric: "Agricultura y Ganadería",
    manufactura: "Manufactura",
    construccion: "Construcción",
    ind_ext: "Ind. Extractiva",
    comercio: "Comercio",
    restaurantes: "Rest. y Alojamiento",
    transportes: "Transportes",
    serv_prof: "Serv. Profesionales",
    serv_soc: "Servicios Sociales",
    serv_div: "Servicios Diversos",
    gobierno: "Gobierno",
  };
  const etiqUse = isMobile ? ETIQ_MOB : ETIQ;

  const row = ENOE_S32_SUBSECTORES.find((d) => d.p === periodoValido) || {};
  const barData = Object.keys(etiqUse)
    .map((k) => ({ label: etiqUse[k], val: row[k] ?? 0 }))
    .sort((a, b) => b.val - a.val);

  const barColor = (i) => (i < 3 ? MX.vino : i < 7 ? MX.rosa : MX.neutral);

  const selectStyle = {
    fontFamily: FONT,
    fontSize: isMobile ? 10 : 11,
    fontWeight: 600,
    cursor: "pointer",
    padding: isMobile ? "4px 10px" : "5px 12px",
    borderRadius: 20,
    border: `1.5px solid ${MX.vino}`,
    color: MX.vino,
    background: MX.crema,
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    paddingRight: isMobile ? 22 : 28,
  };

  const TooltipSub = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <BaseTooltip
        label={label}
        rows={[
          {
            name: "Ocupados",
            value: `${fmtN(payload[0]?.value)} personas`,
            color: MX.vino,
          },
        ]}
        rawLabel
      />
    );
  };

  // ⚠️  DIMENSIONES — ajusta estos valores para cambiar el tamaño de la gráfica
  const yAxisW = isMobile ? 108 : 210; // ancho del eje Y (nombres de sectores)
  const chartH = isMobile ? 340 : 360; // altura total de la gráfica
  const tickSize = isMobile ? 8 : 9; // tamaño de fuente en ejes

  return (
    <Card isMobile={isMobile} style={{ width: "100%" }}>
      {/* Encabezado con selectores de trimestre y año */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: isMobile ? 10 : 11,
            fontWeight: 700,
            color: MX.vino,
            lineHeight: 1.4,
          }}
        >
          Ocupación por Sector de Actividad Económica — Michoacán
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative" }}>
            <select
              value={trim}
              onChange={(e) => setTrim(e.target.value)}
              style={selectStyle}
            >
              {trimestres.map((t) => (
                <option key={t} value={t}>
                  {t === "I"
                    ? "I Trim."
                    : t === "II"
                      ? "II Trim."
                      : t === "III"
                        ? "III Trim."
                        : "IV Trim."}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: isMobile ? 7 : 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: MX.vino,
                fontSize: 10,
              }}
            >
              ▾
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <select
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              style={selectStyle}
            >
              {años.map((a) => (
                <option key={a} value={a}>
                  20{a}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: isMobile ? 7 : 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: MX.vino,
                fontSize: 10,
              }}
            >
              ▾
            </span>
          </div>
          {!periodos.includes(perKey) && (
            <span style={{ fontFamily: FONT, fontSize: 9, color: MX.rosa }}>
              No disponible — mostrando {periodoValido}
            </span>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={chartH}>
        {/* ⚠️  margin.left: 0 = etiquetas pegadas al borde izq | right = espacio para valores */}
        <BarChart
          data={barData}
          layout="vertical"
          margin={{ left: 0, right: isMobile ? 58 : 72, top: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F0E8EC"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={axTick({ fontSize: isMobile ? 7 : 8 })}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.floor(v / 1000)} mil`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={axTick({ fontSize: tickSize })}
            axisLine={false}
            tickLine={false}
            width={yAxisW}
          />
          <Tooltip content={<TooltipSub />} />
          <Bar dataKey="val" name="Ocupados" radius={[0, 4, 4, 0]}>
            {barData.map((_, i) => (
              <Cell key={i} fill={barColor(i)} />
            ))}
            <LabelList
              dataKey="val"
              position="right"
              style={{
                fontFamily: FONT,
                fontSize: tickSize,
                fill: MX.grayDark,
                fontWeight: 600,
              }}
              /* ⚠️  formato de etiqueta de valor: "483 mil" en todos los tamaños */
              formatter={(v) => `${Math.floor(v / 1000)} mil`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 7 · TAB ENOE — Mercado Laboral
// ────────────────────────────────────────────────────────────────────────────
//  Sección 1 · Fuerza Laboral:
//    pill "PEA vs Ocupados"                 →  GrafPEAOcupados
//    pill "Tasas de Participación y Desoc." →  GrafTasas
//  Sección 2 · Dinámica del Mercado Laboral:
//    pill "Sector de Actividad Económica"   →  GrafSubsectores
//  ⚠️  KPIs: actualizar nacStr con nuevo dato nacional cuando cambie el período
// ════════════════════════════════════════════════════════════════════════════
function TabENOE({ isMobile }) {
  const [secFL, setSecFL] = useState("pea");
  const [secDin, setSecDin] = useState("sectores");

  const lastPEA = ENOE_PEA[ENOE_PEA.length - 1];
  const lastOcup = ENOE_S32_TOTAL[ENOE_S32_TOTAL.length - 1];
  const lastPart = ENOE_PART[ENOE_PART.length - 1];
  const lastDesoc = ENOE_DESOC[ENOE_DESOC.length - 1];

  const KPIs = [
    {
      label: "PEA",
      valor: lastPEA.pea,
      fmt: "M",
      nacStr: "61.2 M",
      color: MX.vino,
      nota: "Población Económicamente Activa (IV 25)",
    },
    {
      label: "T. Participación",
      valor: lastPart.part,
      fmt: "pct",
      nacStr: "60.2%",
      color: MX.vinoMid,
      nota: "% de la PET en el mercado laboral",
    },
    {
      label: "T. Desocupación",
      valor: lastDesoc.desoc,
      fmt: "pct",
      nacStr: "2.7%",
      color: MX.rosa,
      nota: "% de la PEA desocupada",
    },
    {
      label: "Población Ocupada",
      valor: lastOcup.total,
      fmt: "M",
      nacStr: "—",
      color: MX.vino,
      nota: "Ocupados totales S32 (IV 25)",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 18 : 24,
      }}
    >
      {/* KPI Cards — 2x2 en mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: isMobile ? 10 : 14,
        }}
      >
        {KPIs.map((k, i) => (
          <KpiCard key={i} {...k} isMobile={isMobile} />
        ))}
      </div>

      {/* Sección 1 — Fuerza Laboral: dos pestañas */}
      <Section
        title="Fuerza Laboral"
        sub="ENOE Trimestral 2016–2025"
        options={[
          { id: "pea", label: "PEA vs Ocupados" },
          { id: "tasas", label: "Tasas de Participación y Desocupación" },
        ]}
        active={secFL}
        onChange={setSecFL}
        isMobile={isMobile}
      >
        {secFL === "pea" && <GrafPEAOcupados isMobile={isMobile} />}
        {secFL === "tasas" && <GrafTasas isMobile={isMobile} />}
      </Section>

      {/* Sección 2 — Dinámica del Mercado Laboral: solo sectores */}
      <Section
        title="Dinámica del Mercado Laboral"
        sub="ENOE Trimestral 2016–2025"
        options={[{ id: "sectores", label: "Sector de Actividad Económica" }]}
        active={secDin}
        onChange={setSecDin}
        isMobile={isMobile}
      >
        <GrafSubsectores isMobile={isMobile} />
      </Section>

      <div
        style={{
          fontFamily: FONT,
          fontSize: 9,
          color: MX.grayMid,
          textAlign: "right",
        }}
      >
        Fuente: ENOE (INEGI) · data.inegi.org.mx · 2016–2025 (II 2020 excluido:
        ETOE)
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 8 · TAB IMSS — Empleo Formal
// ────────────────────────────────────────────────────────────────────────────
//  Sección 1 · Puestos de Trabajo:
//    pill "Total Anual"               →  BarChart colores alternos (enero c/año)
//    pill "Permanentes vs Eventuales" →  BarChart apilado anual (perm + ev)
//  Sección 2 · Desglose por zona:
//    pill "Zona Urbana"  →  BarChart apilado anual (perm_urb + ev_urb)
//    pill "Zona Campo"   →  BarChart apilado anual (perm_campo + ev_campo)
//  ⚠️  KPIs se calculan automáticamente del último registro de cada array IMSS_PT_*
//  ⚠️  filterIMSS: filtra los datos de la serie para el rango 2016–2026
//  ⚠️  makeTooltip(labelMap): genera tooltip deduplicado para ComposedChart
// ════════════════════════════════════════════════════════════════════════════

// Filtro: solo registros 2016–2026
const filterIMSS = (arr) =>
  arr.filter((d) => {
    const y = parseInt(d.p.slice(-2));
    return y >= 16 || y <= 26;
  });

function TabIMSS({ isMobile }) {
  const [g1, setG1] = useState("anual");
  const [g2, setG2] = useState("urb"); // ← default Zona Urbana

  // ── KPI cards derivados de datos reales ─────────────────────────────────
  const lastTot = IMSS_PT_TOTAL[IMSS_PT_TOTAL.length - 1].tot;
  const lastPerm = IMSS_PT_PERM[IMSS_PT_PERM.length - 1].perm;
  const lastEv = IMSS_PT_EV[IMSS_PT_EV.length - 1].ev;
  const prevTot = IMSS_PT_TOTAL[IMSS_PT_TOTAL.length - 13].tot;
  const prevPerm = IMSS_PT_PERM[IMSS_PT_PERM.length - 13].perm;
  const prevEv = IMSS_PT_EV[IMSS_PT_EV.length - 13].ev;
  const fmtDelta = (v, p) =>
    `${v > p ? "+" : ""}${(v - p).toLocaleString("es-MX")}`;

  const IMSS_KPI = [
    {
      label: "Asegurados Vigentes",
      valor: lastTot,
      fmt: "k",
      delta: fmtDelta(lastTot, prevTot),
      dDir: lastTot >= prevTot ? "pos" : "neg",
      nota: "Puestos de trabajo IMSS (Feb 26)",
      color: MX.vino,
    },
    {
      label: "Permanentes",
      valor: lastPerm,
      fmt: "k",
      delta: fmtDelta(lastPerm, prevPerm),
      dDir: lastPerm >= prevPerm ? "pos" : "neg",
      nota: "Trabajadores con contrato permanente",
      color: MX.vinoMid,
    },
    {
      label: "Eventuales",
      valor: lastEv,
      fmt: "k",
      delta: fmtDelta(lastEv, prevEv),
      dDir: lastEv >= prevEv ? "pos" : "neg",
      nota: "Eventuales campo + urbano",
      color: MX.rosa,
    },
    {
      label: "Permanentes / Total",
      valor: (lastPerm / lastTot) * 100,
      fmt: "pct",
      nota: "Proporción de trabajadores permanentes (Feb 26)",
      color: MX.vino,
    },
  ];

  // ── Tooltip personalizado — deduplica Area+Line del mismo dataKey ────────
  const makeTooltip =
    (labelMap) =>
    ({ active, payload, label }) => {
      if (!active || !payload?.length) return null;
      const seen = new Set();
      const rows = payload
        .filter((p) => {
          if (!p.dataKey || seen.has(p.dataKey)) return false;
          seen.add(p.dataKey);
          return true;
        })
        .map((p) => ({
          name: labelMap?.[p.dataKey] || p.name,
          value: fmtN(p.value),
          color: p.stroke || p.fill || MX.grayDark,
        }));
      return <BaseTooltip label={label} rows={rows} />;
    };

  const TooltipBar = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <BaseTooltip
        label={label}
        rows={[
          {
            name: "Puestos de trabajo",
            value: fmtN(payload[0]?.value),
            color: MX.vino,
          },
        ]}
        rawLabel
      />
    );
  };

  // ── Puestos de Trabajo — pestaña "anual" ────────────────────────────────
  const barData = filterIMSS(IMSS_PT_TOTAL)
    .filter((d) => d.p === "Feb 26" || (d.p.startsWith("Ene") && d.p !== "Ene 26"))
    .map((d) => ({ ...d, anio: "20" + d.p.slice(-2) }));

  // ⚠️  renderLabel: etiqueta sobre cada barra del Total Anual
  // Usa Math.floor para evitar redondeo (499,842 → "499 mil", no "500 mil")
  // isLast = último año recibe énfasis visual (mayor tamaño y color vino)
  const renderLabel = (props) => {
    const { x, y, width, value, index } = props;
    const isLast = index === barData.length - 1;
    const enMiles = Math.floor(value / 1000);
    const label = `${enMiles}\u00A0mil`;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={isLast ? (isMobile ? 9 : 10) : isMobile ? 7 : 8}
        fontWeight={isLast ? 700 : 600}
        fill={isLast ? MX.vino : MX.grayDark}
      >
        {label}
      </text>
    );
  };

  // ── Datos anuales (enero de cada año, feb para 2026) para barras apiladas ─
  // ⚠️  Todas las gráficas de la sección IMSS usan datos anuales (enero)
  const toAnual = (arr) =>
    arr
      .filter((d) => d.p === "Feb 26" || (d.p.startsWith("Ene") && d.p !== "Ene 26"))
      .map((d) => ({ ...d, anio: "20" + d.p.slice(-2) }));

  const compDataAnual = toAnual(
    filterIMSS(mergeByPeriod(IMSS_PT_PERM, IMSS_PT_EV)),
  );
  const dataUrbAnual = toAnual(
    filterIMSS(mergeByPeriod(IMSS_PT_PERM_URB, IMSS_PT_EV_URB)),
  );
  const dataCampoAnual = toAnual(
    filterIMSS(mergeByPeriod(IMSS_PT_PERM_CAMPO, IMSS_PT_EV_CAMPO)),
  );

  // ── Tooltip para barras apiladas — muestra cada segmento + total ────────
  const TtStacked =
    (labelMap) =>
    ({ active, payload, label }) => {
      if (!active || !payload?.length) return null;
      const rows = payload.map((p) => ({
        name: labelMap?.[p.dataKey] || p.name,
        value: fmtN(p.value),
        color: p.fill,
      }));
      const total = payload.reduce((s, p) => s + (p.value || 0), 0);
      return (
        <BaseTooltip
          label={label}
          rows={[
            ...rows,
            {
              name: "Total",
              value: fmtN(total),
              color: MX.grayDark,
              sep: true,
            },
          ]}
          rawLabel
        />
      );
    };

  const TtComp = TtStacked({ perm: "Permanentes", ev: "Eventuales" });
  const TtUrb = TtStacked({
    perm_urb: "Permanentes Urbanos",
    ev_urb: "Eventuales Urbanos",
  });
  const TtCampo = TtStacked({
    perm_campo: "Permanentes Campo",
    ev_campo: "Eventuales Campo",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 18 : 24,
      }}
    >
      {/* KPI Cards — 2x2 en mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: isMobile ? 10 : 14,
        }}
      >
        {IMSS_KPI.map((k, i) => (
          <KpiCard key={i} {...k} isMobile={isMobile} />
        ))}
      </div>

      {/* Sección 1 — Puestos de Trabajo */}
      <Section
        title="Puestos de Trabajo"
        sub="IMSS Mensual 2016–2026"
        options={[
          { id: "anual", label: "Total Anual" },
          { id: "comp", label: "Permanentes vs Eventuales" }, // BarChart apilado anual
        ]}
        active={g1}
        onChange={setG1}
        isMobile={isMobile}
      >
        {g1 === "anual" && (
          // ⚠️  Colores alternos: par = vino, impar = vinoMid
          // ⚠️  barCategoryGap="28%" → espacio claro entre barras
          // ⚠️  YAxis visible con ticks en "mil" para estandarizar la vista
          // ⚠️  interval XAxis mobile: omite un año de cada 2 para no saturar
          <Card
            title="Total de Puestos de Trabajo Asegurados (enero de cada año)"
            isMobile={isMobile}
            style={{ width: "100%" }}
          >
            <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
              <BarChart
                data={barData}
                barCategoryGap="28%"
                margin={{
                  left: isMobile ? 0 : 4,
                  right: isMobile ? 4 : 10,
                  top: 28,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0E8EC"
                  vertical={false}
                />
                <XAxis
                  dataKey="anio"
                  tick={axTick({ fontSize: isMobile ? 8 : 9 })}
                  axisLine={false}
                  tickLine={false}
                  interval={isMobile ? 1 : 0}
                />
                <YAxis
                  tick={axTick({ fontSize: isMobile ? 7 : 8 })}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.floor(v / 1000)} mil`}
                  domain={[350000, 520000]}
                  width={isMobile ? 38 : 52}
                />
                <Tooltip content={<TooltipBar />} />
                <Bar dataKey="tot" radius={[5, 5, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? MX.vino : MX.vinoMid} />
                  ))}
                  <LabelList dataKey="tot" content={renderLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {g1 === "comp" && (
          // ⚠️  Barras apiladas anuales: perm (vino) + ev (rosa)
          // ⚠️  Dominio Y: [0, 520000] = 520 mil | datos: enero de cada año
          <Card
            title="Permanentes vs Eventuales — comparativo anual"
            isMobile={isMobile}
            style={{ width: "100%" }}
          >
            <ResponsiveContainer width="100%" height={isMobile ? 230 : 280}>
              <BarChart
                data={compDataAnual}
                barCategoryGap="22%"
                margin={{
                  left: isMobile ? 4 : 14,
                  right: isMobile ? 4 : 14,
                  top: 16,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0E8EC"
                  vertical={false}
                />
                <XAxis
                  dataKey="anio"
                  tick={axTick({ fontSize: isMobile ? 8 : 9 })}
                  axisLine={false}
                  tickLine={false}
                  interval={isMobile ? 1 : 0}
                />
                <YAxis
                  tick={axTick({ fontSize: isMobile ? 7 : 8 })}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.floor(v / 1000)} mil`}
                  domain={[0, 520000]}
                  width={isMobile ? 38 : 52}
                />
                <Tooltip content={<TtComp />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  formatter={legFmt}
                  payload={[
                    { value: "Permanentes", type: "circle", color: MX.vino },
                    { value: "Eventuales", type: "circle", color: MX.rosa },
                  ]}
                />
                <Bar
                  dataKey="ev"
                  name="Eventuales"
                  stackId="a"
                  fill={MX.rosa}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="perm"
                  name="Permanentes"
                  stackId="a"
                  fill={MX.vino}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </Section>

      {/* Sección 2 — Desglose por zona */}
      <Section
        title="Desglose por zona"
        sub="Permanentes y Eventuales"
        options={[
          { id: "urb", label: "Zona Urbana" },
          { id: "campo", label: "Zona Campo" },
        ]}
        active={g2}
        onChange={setG2}
        isMobile={isMobile}
      >
        {g2 === "urb" && (
          // ⚠️  Barras apiladas: perm_urb (vino) + ev_urb (rosa) | datos anuales enero
          // ⚠️  Dominio Y: [0, 480000] = 480 mil
          <Card
            title="Zona Urbana — Permanentes y Eventuales"
            isMobile={isMobile}
            style={{ width: "100%" }}
          >
            <ResponsiveContainer width="100%" height={isMobile ? 230 : 280}>
              <BarChart
                data={dataUrbAnual}
                barCategoryGap="22%"
                margin={{
                  left: isMobile ? 4 : 14,
                  right: isMobile ? 4 : 14,
                  top: 16,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0E8EC"
                  vertical={false}
                />
                <XAxis
                  dataKey="anio"
                  tick={axTick({ fontSize: isMobile ? 8 : 9 })}
                  axisLine={false}
                  tickLine={false}
                  interval={isMobile ? 1 : 0}
                />
                <YAxis
                  tick={axTick({ fontSize: isMobile ? 7 : 8 })}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.floor(v / 1000)} mil`}
                  domain={[0, 480000]}
                  width={isMobile ? 38 : 52}
                />
                <Tooltip content={<TtUrb />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  formatter={legFmt}
                  payload={[
                    {
                      value: "Permanentes Urbanos",
                      type: "circle",
                      color: MX.vino,
                    },
                    {
                      value: "Eventuales Urbanos",
                      type: "circle",
                      color: MX.rosa,
                    },
                  ]}
                />
                <Bar
                  dataKey="ev_urb"
                  name="Eventuales Urbanos"
                  stackId="b"
                  fill={MX.rosa}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="perm_urb"
                  name="Permanentes Urbanos"
                  stackId="b"
                  fill={MX.vino}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {g2 === "campo" && (
          // ⚠️  Barras apiladas: perm_campo (vino) + ev_campo (rosa) | datos anuales enero
          // ⚠️  Dominio Y: [0, 70000] = 70 mil
          <Card
            title="Zona Campo — Permanentes y Eventuales"
            isMobile={isMobile}
            style={{ width: "100%" }}
          >
            <ResponsiveContainer width="100%" height={isMobile ? 230 : 280}>
              <BarChart
                data={dataCampoAnual}
                barCategoryGap="22%"
                margin={{
                  left: isMobile ? 4 : 14,
                  right: isMobile ? 4 : 14,
                  top: 16,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0E8EC"
                  vertical={false}
                />
                <XAxis
                  dataKey="anio"
                  tick={axTick({ fontSize: isMobile ? 8 : 9 })}
                  axisLine={false}
                  tickLine={false}
                  interval={isMobile ? 1 : 0}
                />
                <YAxis
                  tick={axTick({ fontSize: isMobile ? 7 : 8 })}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.floor(v / 1000)} mil`}
                  domain={[0, 70000]}
                  width={isMobile ? 38 : 52}
                />
                <Tooltip content={<TtCampo />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  formatter={legFmt}
                  payload={[
                    {
                      value: "Permanentes Campo",
                      type: "circle",
                      color: MX.vino,
                    },
                    {
                      value: "Eventuales Campo",
                      type: "circle",
                      color: MX.rosa,
                    },
                  ]}
                />
                <Bar
                  dataKey="ev_campo"
                  name="Eventuales Campo"
                  stackId="c"
                  fill={MX.rosa}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="perm_campo"
                  name="Permanentes Campo"
                  stackId="c"
                  fill={MX.vino}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </Section>

      <div
        style={{
          fontFamily: FONT,
          fontSize: 9,
          color: MX.grayMid,
          textAlign: "right",
        }}
      >
        Fuente: IMSS CUBOS · imss.gob.mx · 2016–2026
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 9 · TAB SECTORES — Distribución ENOE + IMSS
// ────────────────────────────────────────────────────────────────────────────
//  Sección 1 · Distribución por sector (PieChart):
//    pill "Vista ENOE" →  pieENOE (Primario / Secundario / Terciario, ENOE S41)
//    pill "Vista IMSS" →  pieIMSS (Primario / Secundario / Terciario, IMSS Ene 26)
//  Sección 2 · Barras horizontales por subsector:
//    pill "Vista ENOE" →  barENOE  (selector trimestre/año, datos ENOE_S41_SUBSECTORES)
//    pill "Vista IMSS" →  barIMSS  (punto fijo Ene 26, datos IMSS_SECTORES_ENE26)
//  ⚠️  ETIQ_IMSS  →  nombres de los 10 subsectores IMSS  (editar aquí)
//  ⚠️  Formato de valores: "XX mil" / "XX,XXX" según tamaño
// ════════════════════════════════════════════════════════════════════════════

// ⚠️  ETIQ_IMSS — nombres de los 10 subsectores IMSS para barras horizontales
//  Editar aquí para cambiar las etiquetas de la vista IMSS en TabSectores
const ETIQ_IMSS = {
  agric: "Agricultura, Ganadería, Silvicultura y Pesca",
  ind_ext: "Industrias Extractivas",
  transf_1: "Ind. de Transformación (alimentos / textil)",
  transf_2: "Ind. de Transformación (química / metal)",
  construccion: "Industria de la Construcción",
  electrica: "Ind. Eléctrica y Captación de Agua",
  comercio: "Comercio",
  transportes: "Transportes y Comunicaciones",
  serv_empresas: "Servicios para Empresas y Personas",
  serv_soc: "Servicios Sociales y Comunales",
};

function TabSectores({ isMobile }) {
  const [pie, setPie] = useState("enoe");
  const [bar, setBar] = useState("enoe");

  // ── Sección 1: Pie grandes sectores ──────────────────────────────────────
  const lastS41G = ENOE_S41_GRANDES[ENOE_S41_GRANDES.length - 1];
  const totENOE = lastS41G.primario + lastS41G.secundario + lastS41G.terciario;
  const pieENOE = [
    {
      s: "Primario",
      v: +((lastS41G.primario / totENOE) * 100).toFixed(1),
      c: MX.vino,
    },
    {
      s: "Secundario",
      v: +((lastS41G.secundario / totENOE) * 100).toFixed(1),
      c: MX.rosa,
    },
    {
      s: "Terciario",
      v: +((lastS41G.terciario / totENOE) * 100).toFixed(1),
      c: MX.rosaLt,
    },
  ];
  const lastIMSSG = IMSS_GRANDES_ENE26[0];
  const totIMSS =
    lastIMSSG.primario + lastIMSSG.secundario + lastIMSSG.terciario;
  const pieIMSS = [
    {
      s: "Primario",
      v: +((lastIMSSG.primario / totIMSS) * 100).toFixed(1),
      c: MX.vino,
    },
    {
      s: "Secundario",
      v: +((lastIMSSG.secundario / totIMSS) * 100).toFixed(1),
      c: MX.rosa,
    },
    {
      s: "Terciario",
      v: +((lastIMSSG.terciario / totIMSS) * 100).toFixed(1),
      c: MX.rosaLt,
    },
  ];
  const pieData = pie === "enoe" ? pieENOE : pieIMSS;

  // ── Sección 2: Barras subsectores ─────────────────────────────────────────
  // ENOE — selector trimestre/año (igual que GrafSubsectores)
  const periodos = ENOE_S41_SUBSECTORES.map((d) => d.p);
  const años = [...new Set(periodos.map((p) => p.split(" ")[1]))];
  const trimestres = ["I", "II", "III", "IV"];
  const lastP = periodos[periodos.length - 1].split(" ");
  const [trim, setTrim] = useState(lastP[0]);
  const [anio, setAnio] = useState(lastP[1]);
  const perKey = `${trim} ${anio}`;
  const perValid = periodos.includes(perKey)
    ? perKey
    : periodos[periodos.length - 1];
  const rowENOE = ENOE_S41_SUBSECTORES.find((d) => d.p === perValid) || {};
  const barENOE = Object.keys(ETIQ)
    .map((k) => ({ label: ETIQ[k], val: rowENOE[k] ?? 0 }))
    .sort((a, b) => b.val - a.val);

  // IMSS — punto fijo Ene 26
  const rowIMSS = IMSS_SECTORES_ENE26[0];
  const barIMSS = Object.keys(ETIQ_IMSS)
    .map((k) => ({ label: ETIQ_IMSS[k], val: rowIMSS[k] ?? 0 }))
    .sort((a, b) => b.val - a.val);

  const barData = bar === "enoe" ? barENOE : barIMSS;
  const barColor = (i) => (i < 3 ? MX.vino : i < 7 ? MX.rosa : MX.neutral);

  const selectStyle = {
    fontFamily: FONT,
    fontSize: isMobile ? 10 : 11,
    fontWeight: 600,
    cursor: "pointer",
    padding: isMobile ? "4px 10px" : "5px 12px",
    borderRadius: 20,
    border: `1.5px solid ${MX.vino}`,
    color: MX.vino,
    background: MX.crema,
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    paddingRight: isMobile ? 22 : 28,
  };

  const TooltipPie = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <BaseTooltip
        label={d.name}
        rows={[
          { name: "Participación", value: `${d.value}%`, color: d.payload?.c },
        ]}
        rawLabel
      />
    );
  };

  const TooltipSub2 = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <BaseTooltip
        label={label}
        rows={[
          {
            name: bar === "enoe" ? "Trabajadores" : "Asegurados",
            value: fmtN(payload[0]?.value),
            color: MX.vino,
          },
        ]}
        rawLabel
      />
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 18 : 24,
      }}
    >
      {/* SECCIÓN 1 — Pie grandes sectores */}
      <Section
        title="Distribución por sector"
        sub="Comparativo ENOE · IMSS"
        options={[
          { id: "enoe", label: "Vista ENOE" },
          { id: "imss", label: "Vista IMSS" },
        ]}
        active={pie}
        onChange={setPie}
        isMobile={isMobile}
      >
        <Card
          title={
            pie === "enoe"
              ? `ENOE — Trabajadores subordinados y remunerados por sector (${perValid})`
              : "IMSS — Asegurados por gran sector (Ene 26)"
          }
          isMobile={isMobile}
          style={{ width: "100%" }}
        >
          {/* En mobile: pie arriba, leyenda debajo centrada */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 10 : 32,
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%", maxWidth: isMobile ? "100%" : 310 }}>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="v"
                    nameKey="s"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 75 : 100}
                    paddingAngle={2}
                    label={<PieLabel />}
                    labelLine={false}
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.c} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipPie />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                flexWrap: "wrap",
                gap: isMobile ? "8px 18px" : 10,
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              {pieData.map((d, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    style={{
                      width: isMobile ? 10 : 12,
                      height: isMobile ? 10 : 12,
                      borderRadius: "50%",
                      background: d.c,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: isMobile ? 11 : 11,
                      color: MX.grayDark,
                      fontWeight: 600,
                    }}
                  >
                    {d.s}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: isMobile ? 11 : 11,
                      color: MX.grayMid,
                    }}
                  >
                    {d.v}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      {/* SECCIÓN 2 — Barras por subsector */}
      <Section
        title="Distribución por Sector de Actividad Económica"
        options={[
          { id: "enoe", label: "Vista ENOE" },
          { id: "imss", label: "Vista IMSS" },
        ]}
        active={bar}
        onChange={setBar}
        isMobile={isMobile}
      >
        <Card isMobile={isMobile} style={{ width: "100%" }}>
          {/* Encabezado con selector período (solo ENOE) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: isMobile ? 10 : 11,
                fontWeight: 700,
                color: MX.vino,
                lineHeight: 1.4,
              }}
            >
              {bar === "enoe"
                ? "ENOE — Trabajadores subordinados y remunerados por subsector"
                : "IMSS — Asegurados por rama de actividad (Ene 26)"}
            </div>
            {bar === "enoe" && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative" }}>
                  <select
                    value={trim}
                    onChange={(e) => setTrim(e.target.value)}
                    style={selectStyle}
                  >
                    {trimestres.map((t) => (
                      <option key={t} value={t}>
                        {t === "I"
                          ? "I Trim."
                          : t === "II"
                            ? "II Trim."
                            : t === "III"
                              ? "III Trim."
                              : "IV Trim."}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: isMobile ? 7 : 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: MX.vino,
                      fontSize: 10,
                    }}
                  >
                    ▾
                  </span>
                </div>
                <div style={{ position: "relative" }}>
                  <select
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    style={selectStyle}
                  >
                    {años.map((a) => (
                      <option key={a} value={a}>
                        20{a}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: isMobile ? 7 : 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: MX.vino,
                      fontSize: 10,
                    }}
                  >
                    ▾
                  </span>
                </div>
                {!periodos.includes(perKey) && (
                  <span
                    style={{ fontFamily: FONT, fontSize: 9, color: MX.rosa }}
                  >
                    No disponible — mostrando {perValid}
                  </span>
                )}
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 380 : 360}>
            {/* ⚠️  margin.left: 0 = etiquetas pegadas al borde izq | right = espacio para valores */}
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ left: 0, right: isMobile ? 58 : 72, top: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0E8EC"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={axTick({ fontSize: isMobile ? 7 : 8 })}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.floor(v / 1000)} mil`}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={axTick({ fontSize: isMobile ? 7.5 : 9 })}
                axisLine={false}
                tickLine={false}
                width={isMobile ? 110 : 205}
              />
              <Tooltip content={<TooltipSub2 />} />
              <Bar dataKey="val" name="Trabajadores" radius={[0, 4, 4, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={barColor(i)} />
                ))}
                <LabelList
                  dataKey="val"
                  position="right"
                  style={{
                    fontFamily: FONT,
                    fontSize: isMobile ? 8 : 9,
                    fill: MX.grayDark,
                    fontWeight: 600,
                  }}
                  /* ⚠️  formato de etiqueta de valor: "483 mil" en todos los tamaños */
                  formatter={(v) => `${Math.floor(v / 1000)} mil`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {bar === "imss" && (
            <div
              style={{
                fontFamily: FONT,
                fontSize: 9,
                color: MX.grayMid,
                textAlign: "right",
                marginTop: 8,
              }}
            >
              Fuente: IMSS CUBOS · Enero 2026 · Delegación Michoacán · 499,842
              asegurados totales
            </div>
          )}
        </Card>
      </Section>

      <div
        style={{
          fontFamily: FONT,
          fontSize: 9,
          color: MX.grayMid,
          textAlign: "right",
        }}
      >
        Fuentes: ENOE (INEGI) · IMSS CUBOS · Michoacán · 2016–2026
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  BLOQUE 10 · APP PRINCIPAL — layout raíz, header y enrutamiento de tabs
// ────────────────────────────────────────────────────────────────────────────
//  ⚠️  "IV Trim. 2025"  →  actualizar con el período más reciente disponible
//  ⚠️  isMobile = width ≤ 430  →  ajusta el breakpoint si se necesita otro dispositivo
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("enoe");
  const width = useWindowWidth();
  const isMobile = width <= 430;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: MX.grayLt,
        fontFamily: FONT,
        color: MX.grayDark,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: MX.white,
          borderBottom: `3px solid ${MX.vino}`,
          padding: isMobile ? "12px 16px" : "14px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 8 : 0,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: isMobile ? 8 : 9,
              fontWeight: 700,
              letterSpacing: isMobile ? 1.5 : 3,
              color: MX.rosa,
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            Secretaría de Desarrollo Económico · Michoacán es Mejor
          </div>
          <div
            style={{
              fontSize: isMobile ? 15 : 19,
              fontWeight: 700,
              color: MX.vinoDark,
              lineHeight: 1.2,
            }}
          >
            Dashboard de Indicadores Laborales
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 8, color: MX.grayMid, marginBottom: 3 }}>
            Último período
          </div>
          <div
            style={{
              fontSize: isMobile ? 10 : 11,
              fontWeight: 700,
              color: MX.vino,
              background: MX.crema,
              border: `1px solid ${MX.border}`,
              borderRadius: 6,
              padding: isMobile ? "4px 10px" : "4px 14px",
              textAlign: "center",
            }}
          >
            IV Trim. 2025
          </div>
        </div>
      </div>

      {/* TABS PRINCIPALES — scroll horizontal en mobile */}
      <div
        style={{
          background: MX.white,
          borderBottom: `1px solid ${MX.border}`,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          display: "flex",
          paddingLeft: isMobile ? 0 : 36,
        }}
      >
        {NAV.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontFamily: FONT,
              background: "transparent",
              border: "none",
              borderBottom:
                tab === t.id ? `3px solid ${MX.vino}` : "3px solid transparent",
              padding: isMobile ? "10px 16px" : "12px 22px",
              cursor: "pointer",
              transition: "all .15s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? MX.vino : MX.grayMid,
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </span>
            <span
              style={{
                fontSize: 9,
                color: tab === t.id ? MX.rosa : "#ccc",
                whiteSpace: "nowrap",
              }}
            >
              {t.sub}
            </span>
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: isMobile ? "16px 16px 32px" : "24px 36px" }}>
        {tab === "enoe" && <TabENOE isMobile={isMobile} />}
        {tab === "imss" && <TabIMSS isMobile={isMobile} />}
        {tab === "sectores" && <TabSectores isMobile={isMobile} />}
      </div>
    </div>
  );
}
