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
  if (fmt === "k") return <>{(n / 1000).toFixed(0)} mil</>;
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
      nacStr: "61.3 M",
      color: MX.vino,
      nota: "Población Económicamente Activa (IV 25)",
    },
    {
      label: "T. Participación",
      valor: lastPart.part,
      fmt: "pct",
      nacStr: "59.3%",
      color: MX.vinoMid,
      nota: "% de la PET en el mercado laboral",
    },
    {
      label: "T. Desocupación",
      valor: lastDesoc.desoc,
      fmt: "pct",
      nacStr: "2.5%",
      color: MX.rosa,
      nota: "% de la PEA desocupada",
    },
    {
      label: "Población Ocupada",
      valor: lastOcup.total,
      fmt: "M",
      nacStr: "59.8 M",
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
//  GRÁFICA · GrafTop10Municipios
// ────────────────────────────────────────────────────────────────────────────
//  Tipo: BarChart horizontal (layout="vertical")  |  Datos: IMSS_TOP10_MUN
//  Replica el patrón de GrafSubsectores: colores por ranking, LabelList derecho
//  barColor: top 3 = vino, 4–7 = rosa, resto = neutral
// ════════════════════════════════════════════════════════════════════════════
function GrafTop10Municipios({ isMobile }) {
  const barData = [...IMSS_TOP10_MUN].sort((a, b) => b.empleo - a.empleo);
  const barColor = (i) => (i < 3 ? MX.vino : i < 7 ? MX.rosa : MX.neutral);

  const TooltipMun = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = barData.find((d) => d.municipio === label) || {};
    return (
      <BaseTooltip
        label={label}
        rawLabel
        rows={[
          { name: "Trabajadores formales", value: fmtN(row.empleo), color: MX.vino },
          { name: "SBC promedio", value: row.sbc ? `$${row.sbc.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—", color: MX.grayDark, sep: true },
        ]}
      />
    );
  };

  return (
    <Card style={{ width: "100%" }} isMobile={isMobile}>
      <div style={{ fontFamily: FONT, fontSize: isMobile ? 10 : 11, fontWeight: 700, color: MX.vino, marginBottom: 12 }}>
        Top 10 Municipios — Asegurados IMSS (Feb 2026)
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 340}>
        <BarChart
          data={barData}
          layout="vertical"
          margin={{ left: 0, right: isMobile ? 62 : 80, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" horizontal={false} />
          <XAxis
            type="number"
            tick={axTick({ fontSize: isMobile ? 7 : 8 })}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.floor(v / 1000)} mil`}
          />
          <YAxis
            type="category"
            dataKey="municipio"
            tick={axTick({ fontSize: isMobile ? 8 : 9.5 })}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 100 : 140}
          />
          <Tooltip content={<TooltipMun />} />
          <Bar dataKey="empleo" name="Trabajadores" radius={[0, 4, 4, 0]}>
            {barData.map((_, i) => (
              <Cell key={i} fill={barColor(i)} />
            ))}
            <LabelList
              dataKey="empleo"
              position="right"
              style={{ fontFamily: FONT, fontSize: isMobile ? 8 : 9, fill: MX.grayDark, fontWeight: 600 }}
              formatter={(v) => fmtN(v)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TABLA · TablaTop10Municipios
// ────────────────────────────────────────────────────────────────────────────
//  Encabezado: vino con texto blanco  |  Filas: alternancia gris claro / blanco
//  Columnas: Rango · Municipio · Trabajadores Formales · SBC Promedio · % del Total
// ════════════════════════════════════════════════════════════════════════════
function TablaTop10Municipios({ isMobile }) {
  const sorted = [...IMSS_TOP10_MUN].sort((a, b) => b.empleo - a.empleo);
  const totalMich = IMSS_PT_TOTAL[IMSS_PT_TOTAL.length - 1].tot;

  const thStyle = (align = "right") => ({
    fontFamily: FONT,
    fontSize: isMobile ? 9 : 10,
    fontWeight: 700,
    color: MX.white,
    background: MX.vino,
    padding: isMobile ? "8px 8px" : "10px 14px",
    textAlign: align,
    whiteSpace: "nowrap",
    borderRight: `1px solid ${MX.vinoMid}`,
  });

  const tdStyle = (align = "right", rowIdx) => ({
    fontFamily: FONT,
    fontSize: isMobile ? 9 : 10,
    color: MX.grayDark,
    background: rowIdx % 2 === 0 ? "#F7F8FA" : MX.white,
    padding: isMobile ? "7px 8px" : "9px 14px",
    textAlign: align,
    borderBottom: `1px solid #EAEDF0`,
    borderRight: `1px solid #EAEDF0`,
  });

  const topTotal = sorted.reduce((s, d) => s + d.empleo, 0);

  return (
    <Card style={{ width: "100%", overflowX: "auto", padding: 0 }} isMobile={isMobile}>
      <div style={{ padding: isMobile ? "12px 12px 4px" : "14px 16px 6px", fontFamily: FONT, fontSize: isMobile ? 10 : 11, fontWeight: 700, color: MX.vino }}>
        Top 10 Municipios — Resumen Estadístico (Feb 2026)
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 9 : 10 }}>
          <thead>
            <tr>
              <th style={thStyle("center")}>#</th>
              <th style={{ ...thStyle("left") }}>Municipio</th>
              <th style={thStyle("right")}>Trabajadores Formales</th>
              <th style={thStyle("right")}>% del Estado</th>
              <th style={{ ...thStyle("right"), borderRight: "none" }}>SBC Promedio</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const pct = ((row.empleo / totalMich) * 100).toFixed(1);
              const isTop3 = i < 3;
              return (
                <tr key={row.municipio}>
                  <td style={{ ...tdStyle("center", i), fontWeight: 700, color: isTop3 ? MX.vino : MX.grayMid, width: 32 }}>
                    {i + 1}
                  </td>
                  <td style={{ ...tdStyle("left", i), fontWeight: isTop3 ? 700 : 400, color: isTop3 ? MX.vinoDark : MX.grayDark }}>
                    {row.municipio}
                  </td>
                  <td style={{ ...tdStyle("right", i), fontWeight: 600 }}>
                    {fmtN(row.empleo)}
                  </td>
                  <td style={{ ...tdStyle("right", i) }}>
                    <span style={{
                      display: "inline-block",
                      background: isTop3 ? MX.crema : "#F0F2F5",
                      color: isTop3 ? MX.vino : MX.grayMid,
                      border: `1px solid ${isTop3 ? MX.border : "#DDE1E6"}`,
                      borderRadius: 20,
                      padding: "1px 8px",
                      fontSize: isMobile ? 8 : 9,
                      fontWeight: isTop3 ? 700 : 500,
                    }}>
                      {pct}%
                    </span>
                  </td>
                  <td style={{ ...tdStyle("right", i), borderRight: "none", color: MX.grayMid }}>
                    ${row.sbc.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
            {/* Fila de subtotal Top 10 */}
            <tr>
              <td colSpan={2} style={{ fontFamily: FONT, fontSize: isMobile ? 9 : 10, fontWeight: 700, color: MX.vinoDark, background: MX.crema, padding: isMobile ? "8px 8px" : "10px 14px", textAlign: "left", borderTop: `2px solid ${MX.border}` }}>
                Subtotal Top 10
              </td>
              <td style={{ fontFamily: FONT, fontSize: isMobile ? 9 : 10, fontWeight: 700, color: MX.vinoDark, background: MX.crema, padding: isMobile ? "8px 8px" : "10px 14px", textAlign: "right", borderTop: `2px solid ${MX.border}` }}>
                {fmtN(topTotal)}
              </td>
              <td style={{ fontFamily: FONT, fontSize: isMobile ? 9 : 10, fontWeight: 700, color: MX.vinoDark, background: MX.crema, padding: isMobile ? "8px 8px" : "10px 14px", textAlign: "right", borderTop: `2px solid ${MX.border}` }}>
                {((topTotal / totalMich) * 100).toFixed(1)}%
              </td>
              <td style={{ fontFamily: FONT, fontSize: isMobile ? 9 : 10, background: MX.crema, padding: isMobile ? "8px 8px" : "10px 14px", borderTop: `2px solid ${MX.border}` }} />
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 9, color: MX.grayMid, textAlign: "right", padding: "6px 16px 12px" }}>
        % calculado sobre {fmtN(totalMich)} asegurados totales del estado · IMSS CUBOS
      </div>
    </Card>
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
  const [g3, setG3] = useState("barras"); // ← default barras para municipios

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
      delta: `${((lastPerm / lastTot) * 100 - (prevPerm / prevTot) * 100).toFixed(1)} pp`,
      dDir: (lastPerm / lastTot) >= (prevPerm / prevTot) ? "pos" : "neg",
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

      {/* ── Sección 2 · Concentración Municipal del Empleo Formal ──────────── */}
      <Section
        title="Concentración Municipal del Empleo Formal"
        sub="IMSS · Feb 2026"
        options={[
          { id: "barras", label: "Distribución por Municipio" },
          { id: "tabla",  label: "Resumen Estadístico" },
        ]}
        active={g3}
        onChange={setG3}
        isMobile={isMobile}
      >
        {g3 === "barras" && <GrafTop10Municipios isMobile={isMobile} />}
        {g3 === "tabla"  && <TablaTop10Municipios isMobile={isMobile} />}
      </Section>

      {/* Sección 3 — Desglose por zona */}
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
//  GRÁFICA · GrafPEAvsFormal
// ────────────────────────────────────────────────────────────────────────────
//  Tipo: BarChart apilado trimestral — eje único, sin bugs de doble escala
//  Segmento inferior (verde):  Empleo Formal IMSS  →  asegurados vigentes
//  Segmento superior (vino):   Resto PEA           →  PEA − Empleo Formal
//  Lectura: de toda la fuerza laboral, cuánto tiene empleo registrado
//  Datos IMSS: serie mensual muestreada Ene/Abr/Jul/Oct → trimestral ENOE
// ════════════════════════════════════════════════════════════════════════════

// Convierte serie mensual IMSS a trimestral muestreando Ene/Abr/Jul/Oct
const MES_TRIM_MAP = { Ene: "I", Abr: "II", Jul: "III", Oct: "IV" };
function imssToTrim(arr, srcKey, dstKey) {
  return arr
    .filter((d) => MES_TRIM_MAP[d.p.split(" ")[0]] !== undefined)
    .map((d) => {
      const [mes, yr] = d.p.split(" ");
      return { p: `${MES_TRIM_MAP[mes]} ${yr}`, [dstKey]: d[srcKey] };
    });
}

function GrafPEAvsFormal({ isMobile }) {
  const imssTrim = imssToTrim(IMSS_PT_TOTAL, "tot", "formal");
  const merged   = mergeByPeriod(ENOE_PEA, imssTrim);
  const data = merged
    .filter((d) => d.pea != null && d.formal != null)
    .map((d) => ({
      p:      d.p,
      formal: d.formal,
      resto:  d.pea - d.formal,
      pea:    d.pea,
    }));

  const TtFormal = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = data.find((d) => d.p === label) || {};
    const pct = row.pea ? ((row.formal / row.pea) * 100).toFixed(1) : null;
    return (
      <BaseTooltip
        label={label}
        rows={[
          { name: "PEA Total",           value: fmtN(row.pea),    color: MX.grayDark },
          { name: "Empleo Formal IMSS",  value: fmtN(row.formal), color: MX.green, sep: true },
          { name: "Sin registro formal", value: fmtN(row.resto),  color: MX.vino },
          ...(pct ? [{ name: "Tasa de formalización", value: `${pct}%`, color: MX.grayMid, sep: true }] : []),
        ]}
      />
    );
  };

  return (
    <Card
      title="PEA Total: Empleo Formal IMSS vs Sin Registro Formal — Michoacán"
      isMobile={isMobile}
      style={{ width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
        <BarChart
          data={data}
          barCategoryGap="18%"
          margin={{ left: isMobile ? 2 : 10, right: isMobile ? 4 : 14, top: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" vertical={false} />
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
            domain={[0, 2600000]}
            width={isMobile ? 36 : 46}
          />
          <Tooltip content={<TtFormal />} />
          <Legend
            iconType="circle"
            iconSize={7}
            formatter={legFmt}
            payload={[
              { value: "Empleo Formal IMSS",  type: "circle", color: MX.green },
              { value: "Sin registro formal",  type: "circle", color: MX.vino  },
            ]}
          />
          <Bar dataKey="formal" name="Empleo Formal IMSS"  stackId="pea" fill={MX.green} radius={[0,0,0,0]} />
          <Bar dataKey="resto"  name="Sin registro formal" stackId="pea" fill={MX.vino}  radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontFamily: FONT, fontSize: 9, color: MX.grayMid, marginTop: 6 }}>
        * IMSS mensual muestreado al inicio de cada trimestre (Ene, Abr, Jul, Oct) para alinear con períodos ENOE.
      </div>
    </Card>
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
      {/* SECCIÓN 0 — Fuerza Laboral y Formalización (PEA vs Ocupados vs IMSS) */}
      <Section
        title="Fuerza Laboral y Formalización"
        sub="ENOE + IMSS · 2016–2026"
        isMobile={isMobile}
      >
        <GrafPEAvsFormal isMobile={isMobile} />
      </Section>

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
        {/* LOGO institucional — reemplazar src con la ruta real del logo */}
        {!isMobile && (
          <div style={{ flexShrink: 0, marginRight: 20, display: "flex", alignItems: "center" }}>
            <img
              src="data:image/png;base64,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vcIVHRMrejV1s1+fIz5frWue4Na0uceIAZJWixabs0e/rQOP6z3H2r1NTZbY0hslHT44wzG15hvTo+9nS0iUedSaS/PAqFr0zcash0rOtYj8qQdt5G8fnwrlb6SlstuLOGcIm9s58j92fUPIoa46wp2AtoYHSu+e/tW+bjPoVWuVzrbjJtVUxeB8Fg3Nb3gpzGOxYq9pZey9aXf+f0d2rLtHdKxnANxDCC1riN7s8Z7yhURVt5eTHq1ZVZuct2ERFBWEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAddtuNZbpHPpJdguGHDAIPkK+a2urK1+1VVEkp5ATuHeHEFzIpy9jvpJ8PBnl3BERQcBe9DR1NbOIaWF0j+YcQ6SeRKClmrauOmgbl7zgdHSehaHS09DYLU4lwaxozI88b3f+cQXcY5PdZWTuG5SeIrdlaZpW8RxbUdTC13zGyOHsUTWSXaimMNTPVxPHIZDv72/ep4ayf13vo29bZ4trt8c/N5FOV1LRX+1tc1wcHDaikA3sP/nGF1wp9U93otCvFq2m8rs7zOpJppPzksj/AN5xK817VtNLSVUlNO3ZkjOD714qoxZZTxLcIiIchERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARS9Ppy7zwsmZTANeMjaeAcd5ffYvefo7PrG+9dcL7j0K0rtZUH9CFRTXYvefo7PrG+9Oxe8/R2fWN96cL7ifQ6/uP6EKimuxe8/R2fWN96di95+js+sb704X3D0Ov7j+hCoprsXvP0dn1jfenYvefo7PrG+9OF9w9Dr+4/oQqKa7F7z9HZ9Y33p2L3n6Oz6xvvThfcPQ6/uP6EKimuxe8/R2fWN96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nG9RVbo6kfk0tTJCeZ42h7CodN9hVU0islmDUkUlFOVul7rT5LI2VDeeN2/zHBUPPDNA/YnikidzPaQfSuGmtzPqUKlLrxaPNERQVBERAEREAREQGkz9ycniJ/prNlpM/cnJ4if6azZWVOw2NX3p+AREVZjhERAEREARF6U8E9Q/YghkldzMaSfQhKTbwjzRTlFpa61GDIxlO3nkdv8AMMqbotH0keDVVEkx5mjZHtK6UJM9tLTriptHHjyKQu6jtFzq8GCjlLT8pw2R5yr6yls1paHcHS0+OJzyNrzneuKs1XbIciHhah36rcDzld8CW7PX+m0qXOvUS+C/P6OSx6U4GZtRcXseWnLYm7xnpPL3l6a2u0cNI63QvDppfzmPkN5u+VFXHVlfUNLKZjKVp5Qdp3n/ANlXnuc9xc5xc4nJJOSVDkksROa15RpUnStlvuz8X3BE+aZkMYy97g1o5yV8K06GtbpKj8ZTNxHHkRZHwncp8n/nEuIrLwZ9tQdeooIsF9eyg03O1pwGw8E3yjZCzZWvX1wD5I7dG7OwduXv43Dzb/KFVF1UeWezVaqnW4Y7R5BERcGYEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAfcEskEzJonlkjCHNI5CtEs1ypb5QOjla3hNnZmiPrHQs4XtSVM9JUNnp5HRyN4iF1GXCe2yvHbS584vdExqHTs9vc6emDpqXjyN7md/o6VAq+WPU9LVtbDWltPPxZPwHeXk8q9rppq3V2ZIh1tKd+1GO1PfHF5sLtwT5xPZV0+FddJbP5fn9meop6t0pdICTCI6lv6jsHzFQ1TTVFM/YqIJIncz2kKtprczKtvVpdeLR8RvfG8Pje5jhxFpwVK0eo7tTYAqeGaPkyja9PH6VEIibWxzTqzpvMG0XGi1lGcCso3N53ROz6D71MQXezXBnBmogdn5Ewx6DxrNkXaqPtNCnq1ePKWJI0Os01aKobTYTC4/KidgebiULW6OqG5NJVRyD5sg2T596r9HX1tIf+GqpYhzB27zcSmqPV9fFgVMUVQ3lONl3o3ehTxQe6Lf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"
              alt="Logo institucional"
              style={{ height: 52, width: "auto", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: isMobile ? 8 : 9,
              fontWeight: 700,
              letterSpacing: isMobile ? 1.5 : 3,
              color: MX.rosa,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Secretaría de Desarrollo Económico · Michoacán es Mejor
          </div>
          {/* Subsecretaría — gris visible sobre fondo blanco */}
          <div
            style={{
              fontSize: isMobile ? 8 : 9,
              fontWeight: 600,
              color: "#8896A5",
              letterSpacing: isMobile ? 0.5 : 1,
              marginBottom: 4,
            }}
          >
            Subsecretaría de Trabajo y Previsión Social
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
            Febrero 2026
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
