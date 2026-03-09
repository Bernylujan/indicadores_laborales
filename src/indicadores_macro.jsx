import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList, ReferenceLine,
  ComposedChart, Area
} from "recharts";

// ─── HOOK RESPONSIVO ─────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 390
  );
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return width;
}

// ─── PALETA ─────────────────────────────────────────────────────────────────
const MX = {
  vino:    "#6B1737", vinoDark:"#4A0F26", vinoMid:"#8C2249",
  rosa:    "#C8427A", rosaLt:"#E8A0BC",  crema:"#F9F0F4",
  grayLt:  "#F5F7FA", grayMid:"#8896A5", grayDark:"#2E3A47",
  white:   "#FFFFFF", green:"#1A7A4A",   border:"#E8DDE3",
  neutral: "#B07080",
};
const FONT = "Tahoma, Geneva, sans-serif";

// ─── TABS PRINCIPALES ────────────────────────────────────────────────────────
const NAV = [
  { id:"enoe",     label:"Mercado Laboral", sub:"ENOE · INEGI" },
  { id:"imss",     label:"Empleo Formal",   sub:"IMSS CUBOS"   },
  { id:"sectores", label:"Sectores",        sub:"ENOE + IMSS"  },
];

// ════════════════════════════════════════════════════════════════════════════
//  DATOS ENOE REALES — Michoacán 2016–2025
// ════════════════════════════════════════════════════════════════════════════

const ENOE_PEA = [
  {p:"I 16",pea:1926170},{p:"II 16",pea:1954099},{p:"III 16",pea:1964710},{p:"IV 16",pea:1941072},
  {p:"I 17",pea:1919012},{p:"II 17",pea:1920656},{p:"III 17",pea:1926302},{p:"IV 17",pea:1933242},
  {p:"I 18",pea:1952846},{p:"II 18",pea:2005951},{p:"III 18",pea:2021150},{p:"IV 18",pea:2007279},
  {p:"I 19",pea:2081647},{p:"II 19",pea:2105005},{p:"III 19",pea:2101448},{p:"IV 19",pea:2100537},
  {p:"I 20",pea:2131347},{p:"III 20",pea:1952809},{p:"IV 20",pea:1973085},
  {p:"I 21",pea:1989700},{p:"II 21",pea:2041844},{p:"III 21",pea:2173381},{p:"IV 21",pea:2165988},
  {p:"I 22",pea:2203754},{p:"II 22",pea:2236441},{p:"III 22",pea:2251196},{p:"IV 22",pea:2246319},
  {p:"I 23",pea:2189342},{p:"II 23",pea:2220568},{p:"III 23",pea:2275618},{p:"IV 23",pea:2273025},
  {p:"I 24",pea:2307150},{p:"II 24",pea:2288048},{p:"III 24",pea:2241689},{p:"IV 24",pea:2251965},
  {p:"I 25",pea:2257524},{p:"II 25",pea:2295756},{p:"III 25",pea:2271570},{p:"IV 25",pea:2259793},
];

const ENOE_S32_TOTAL = [
  {p:"I 16",total:1871618},{p:"II 16",total:1894286},{p:"III 16",total:1897251},{p:"IV 16",total:1887460},
  {p:"I 17",total:1857078},{p:"II 17",total:1861157},{p:"III 17",total:1870102},{p:"IV 17",total:1888916},
  {p:"I 18",total:1913251},{p:"II 18",total:1964940},{p:"III 18",total:1968570},{p:"IV 18",total:1954763},
  {p:"I 19",total:2030297},{p:"II 19",total:2041431},{p:"III 19",total:2035944},{p:"IV 19",total:2041562},
  {p:"I 20",total:2078586},{p:"III 20",total:1901277},{p:"IV 20",total:1926075},
  {p:"I 21",total:1938867},{p:"II 21",total:1995411},{p:"III 21",total:2121992},{p:"IV 21",total:2109740},
  {p:"I 22",total:2167147},{p:"II 22",total:2196269},{p:"III 22",total:2202738},{p:"IV 22",total:2207642},
  {p:"I 23",total:2151774},{p:"II 23",total:2171904},{p:"III 23",total:2226020},{p:"IV 23",total:2218521},
  {p:"I 24",total:2265763},{p:"II 24",total:2241862},{p:"III 24",total:2185244},{p:"IV 24",total:2214780},
  {p:"I 25",total:2221772},{p:"II 25",total:2255591},{p:"III 25",total:2219812},{p:"IV 25",total:2219220},
];

const ENOE_OCUP = [
  {p:"I 16",ocup:1874108},{p:"II 16",ocup:1899919},{p:"III 16",ocup:1903236},{p:"IV 16",ocup:1893806},
  {p:"I 17",ocup:1863003},{p:"II 17",ocup:1867997},{p:"III 17",ocup:1876353},{p:"IV 17",ocup:1891186},
  {p:"I 18",ocup:1914463},{p:"II 18",ocup:1966229},{p:"III 18",ocup:1972183},{p:"IV 18",ocup:1957250},
  {p:"I 19",ocup:2033264},{p:"II 19",ocup:2043399},{p:"III 19",ocup:2039927},{p:"IV 19",ocup:2043616},
  {p:"I 20",ocup:2081384},{p:"III 20",ocup:1902879},{p:"IV 20",ocup:1927870},
  {p:"I 21",ocup:1939107},{p:"II 21",ocup:2001324},{p:"III 21",ocup:2125618},{p:"IV 21",ocup:2110933},
  {p:"I 22",ocup:2168027},{p:"II 22",ocup:2197848},{p:"III 22",ocup:2209525},{p:"IV 22",ocup:2208839},
  {p:"I 23",ocup:2152972},{p:"II 23",ocup:2176263},{p:"III 23",ocup:2230897},{p:"IV 23",ocup:2225476},
  {p:"I 24",ocup:2267530},{p:"II 24",ocup:2248664},{p:"III 24",ocup:2191694},{p:"IV 24",ocup:2219125},
  {p:"I 25",ocup:2231080},{p:"II 25",ocup:2258881},{p:"III 25",ocup:2227830},{p:"IV 25",ocup:2227842},
];

const ENOE_DESOC_ABS = [
  {p:"I 16",desoc_abs:52062},{p:"II 16",desoc_abs:54180},{p:"III 16",desoc_abs:61474},{p:"IV 16",desoc_abs:47266},
  {p:"I 17",desoc_abs:56009},{p:"II 17",desoc_abs:52659},{p:"III 17",desoc_abs:49949},{p:"IV 17",desoc_abs:42056},
  {p:"I 18",desoc_abs:38383},{p:"II 18",desoc_abs:39722},{p:"III 18",desoc_abs:48967},{p:"IV 18",desoc_abs:50029},
  {p:"I 19",desoc_abs:48383},{p:"II 19",desoc_abs:61606},{p:"III 19",desoc_abs:61521},{p:"IV 19",desoc_abs:56921},
  {p:"I 20",desoc_abs:49963},{p:"III 20",desoc_abs:49930},{p:"IV 20",desoc_abs:45215},
  {p:"I 21",desoc_abs:50593},{p:"II 21",desoc_abs:40520},{p:"III 21",desoc_abs:47763},{p:"IV 21",desoc_abs:55055},
  {p:"I 22",desoc_abs:35727},{p:"II 22",desoc_abs:38593},{p:"III 22",desoc_abs:41671},{p:"IV 22",desoc_abs:37480},
  {p:"I 23",desoc_abs:36370},{p:"II 23",desoc_abs:44305},{p:"III 23",desoc_abs:44721},{p:"IV 23",desoc_abs:47549},
  {p:"I 24",desoc_abs:39620},{p:"II 24",desoc_abs:39384},{p:"III 24",desoc_abs:49995},{p:"IV 24",desoc_abs:32840},
  {p:"I 25",desoc_abs:26444},{p:"II 25",desoc_abs:36875},{p:"III 25",desoc_abs:43740},{p:"IV 25",desoc_abs:31951},
];

const ENOE_PART = [
  {p:"I 16",part:59.39},{p:"II 16",part:60.12},{p:"III 16",part:60.61},{p:"IV 16",part:60.17},
  {p:"I 17",part:59.35},{p:"II 17",part:58.8},{p:"III 17",part:58.82},{p:"IV 17",part:59.27},
  {p:"I 18",part:59.64},{p:"II 18",part:60.52},{p:"III 18",part:59.65},{p:"IV 18",part:59.08},
  {p:"I 19",part:60.44},{p:"II 19",part:60.65},{p:"III 19",part:60.24},{p:"IV 19",part:59.96},
  {p:"I 20",part:61.0},{p:"III 20",part:56.11},{p:"IV 20",part:56.7},
  {p:"I 21",part:56.32},{p:"II 21",part:57.04},{p:"III 21",part:59.62},{p:"IV 21",part:59.09},
  {p:"I 22",part:59.39},{p:"II 22",part:61.12},{p:"III 22",part:61.68},{p:"IV 22",part:61.51},
  {p:"I 23",part:59.94},{p:"II 23",part:60.74},{p:"III 23",part:60.38},{p:"IV 23",part:60.94},
  {p:"I 24",part:61.76},{p:"II 24",part:61.61},{p:"III 24",part:60.12},{p:"IV 24",part:60.2},
  {p:"I 25",part:60.51},{p:"II 25",part:60.65},{p:"III 25",part:60.17},{p:"IV 25",part:60.21},
];

const ENOE_DESOC = [
  {p:"I 16",desoc:2.7},{p:"II 16",desoc:2.77},{p:"III 16",desoc:3.13},{p:"IV 16",desoc:2.44},
  {p:"I 17",desoc:2.92},{p:"II 17",desoc:2.74},{p:"III 17",desoc:2.59},{p:"IV 17",desoc:2.18},
  {p:"I 18",desoc:1.97},{p:"II 18",desoc:1.98},{p:"III 18",desoc:2.42},{p:"IV 18",desoc:2.49},
  {p:"I 19",desoc:2.32},{p:"II 19",desoc:2.93},{p:"III 19",desoc:2.93},{p:"IV 19",desoc:2.71},
  {p:"I 20",desoc:2.34},{p:"III 20",desoc:2.56},{p:"IV 20",desoc:2.29},
  {p:"I 21",desoc:2.54},{p:"II 21",desoc:1.98},{p:"III 21",desoc:2.2},{p:"IV 21",desoc:2.54},
  {p:"I 22",desoc:1.62},{p:"II 22",desoc:1.73},{p:"III 22",desoc:1.85},{p:"IV 22",desoc:1.67},
  {p:"I 23",desoc:1.66},{p:"II 23",desoc:2.0},{p:"III 23",desoc:1.97},{p:"IV 23",desoc:2.09},
  {p:"I 24",desoc:1.72},{p:"II 24",desoc:1.72},{p:"III 24",desoc:2.23},{p:"IV 24",desoc:1.46},
  {p:"I 25",desoc:1.17},{p:"II 25",desoc:1.61},{p:"III 25",desoc:1.93},{p:"IV 25",desoc:1.41},
];

const ENOE_S32_SUBSECTORES = [
  {p:"I 16",agric:426977,ind_ext:9638,manufactura:237075,construccion:121818,comercio:378849,restaurantes:139780,transportes:67545,serv_prof:75420,serv_soc:157130,serv_div:191181,gobierno:66205},
  {p:"II 16",agric:464165,ind_ext:10427,manufactura:235382,construccion:141025,comercio:394544,restaurantes:139391,transportes:68728,serv_prof:69358,serv_soc:134937,serv_div:176278,gobierno:60051},
  {p:"III 16",agric:441705,ind_ext:8603,manufactura:222569,construccion:141216,comercio:398843,restaurantes:133599,transportes:66561,serv_prof:81240,serv_soc:139384,serv_div:195836,gobierno:67695},
  {p:"IV 16",agric:437830,ind_ext:9510,manufactura:222929,construccion:149989,comercio:397123,restaurantes:132157,transportes:66612,serv_prof:71397,serv_soc:136717,serv_div:194760,gobierno:68436},
  {p:"I 17",agric:414737,ind_ext:5226,manufactura:197232,construccion:143233,comercio:390001,restaurantes:143062,transportes:65629,serv_prof:73089,serv_soc:151683,serv_div:203524,gobierno:69662},
  {p:"II 17",agric:472331,ind_ext:5766,manufactura:203739,construccion:138656,comercio:358755,restaurantes:142227,transportes:59748,serv_prof:68996,serv_soc:150571,serv_div:200718,gobierno:59650},
  {p:"III 17",agric:475514,ind_ext:2881,manufactura:193403,construccion:163311,comercio:366347,restaurantes:142093,transportes:48458,serv_prof:72837,serv_soc:160209,serv_div:184530,gobierno:60519},
  {p:"IV 17",agric:484203,ind_ext:4584,manufactura:218884,construccion:151501,comercio:362419,restaurantes:128607,transportes:56202,serv_prof:69504,serv_soc:164482,serv_div:184430,gobierno:64100},
  {p:"I 18",agric:473120,ind_ext:6625,manufactura:212124,construccion:157249,comercio:382760,restaurantes:144666,transportes:63513,serv_prof:74573,serv_soc:156608,serv_div:176628,gobierno:65385},
  {p:"II 18",agric:491014,ind_ext:6979,manufactura:223493,construccion:167147,comercio:403724,restaurantes:120713,transportes:70799,serv_prof:75141,serv_soc:159123,serv_div:181596,gobierno:65211},
  {p:"III 18",agric:469157,ind_ext:5544,manufactura:202228,construccion:184219,comercio:395137,restaurantes:134964,transportes:69223,serv_prof:82829,serv_soc:166605,serv_div:190040,gobierno:68624},
  {p:"IV 18",agric:454011,ind_ext:4008,manufactura:186732,construccion:165898,comercio:425279,restaurantes:145988,transportes:67002,serv_prof:75196,serv_soc:156956,serv_div:200259,gobierno:73434},
  {p:"I 19",agric:481000,ind_ext:4900,manufactura:210943,construccion:163862,comercio:447138,restaurantes:151526,transportes:68574,serv_prof:77734,serv_soc:152808,serv_div:206416,gobierno:65396},
  {p:"II 19",agric:479660,ind_ext:6464,manufactura:258304,construccion:166969,comercio:439392,restaurantes:136810,transportes:57771,serv_prof:75252,serv_soc:152571,serv_div:199244,gobierno:68994},
  {p:"III 19",agric:454438,ind_ext:8719,manufactura:267862,construccion:176036,comercio:426285,restaurantes:151123,transportes:62567,serv_prof:80249,serv_soc:158807,serv_div:174871,gobierno:74987},
  {p:"IV 19",agric:467180,ind_ext:7740,manufactura:218203,construccion:168835,comercio:438869,restaurantes:145138,transportes:73466,serv_prof:76903,serv_soc:172129,serv_div:195079,gobierno:78020},
  {p:"I 20",agric:498819,ind_ext:9831,manufactura:222109,construccion:163651,comercio:417700,restaurantes:160209,transportes:65648,serv_prof:88250,serv_soc:178726,serv_div:190620,gobierno:83023},
  {p:"III 20",agric:474998,ind_ext:7023,manufactura:182521,construccion:143055,comercio:376067,restaurantes:118603,transportes:74170,serv_prof:90612,serv_soc:186086,serv_div:172685,gobierno:75457},
  {p:"IV 20",agric:393908,ind_ext:10177,manufactura:183579,construccion:157674,comercio:429136,restaurantes:122685,transportes:86412,serv_prof:93345,serv_soc:155191,serv_div:212442,gobierno:81526},
  {p:"I 21",agric:533505,ind_ext:7495,manufactura:236170,construccion:153400,comercio:371583,restaurantes:108546,transportes:56181,serv_prof:72534,serv_soc:147262,serv_div:184748,gobierno:67443},
  {p:"II 21",agric:461031,ind_ext:3142,manufactura:235994,construccion:152376,comercio:424383,restaurantes:117534,transportes:89448,serv_prof:87630,serv_soc:162223,serv_div:182508,gobierno:79142},
  {p:"III 21",agric:477133,ind_ext:18605,manufactura:213427,construccion:179318,comercio:413841,restaurantes:144284,transportes:87011,serv_prof:110988,serv_soc:199915,serv_div:183415,gobierno:94055},
  {p:"IV 21",agric:482245,ind_ext:18419,manufactura:179580,construccion:184830,comercio:405999,restaurantes:146350,transportes:82254,serv_prof:104544,serv_soc:196606,serv_div:224202,gobierno:84711},
  {p:"I 22",agric:455447,ind_ext:11651,manufactura:230031,construccion:196289,comercio:463933,restaurantes:140781,transportes:79116,serv_prof:104975,serv_soc:203319,serv_div:205712,gobierno:75893},
  {p:"II 22",agric:446453,ind_ext:13374,manufactura:263853,construccion:214837,comercio:443272,restaurantes:156930,transportes:79909,serv_prof:99434,serv_soc:186220,serv_div:209246,gobierno:82741},
  {p:"III 22",agric:491964,ind_ext:12669,manufactura:269561,construccion:196890,comercio:460804,restaurantes:146114,transportes:84903,serv_prof:86788,serv_soc:174704,serv_div:206852,gobierno:71489},
  {p:"IV 22",agric:501741,ind_ext:13578,manufactura:251151,construccion:199663,comercio:457126,restaurantes:151427,transportes:84798,serv_prof:93619,serv_soc:165053,serv_div:214372,gobierno:75114},
  {p:"I 23",agric:491907,ind_ext:9457,manufactura:230678,construccion:186739,comercio:445844,restaurantes:169607,transportes:90984,serv_prof:95329,serv_soc:160426,serv_div:196303,gobierno:74500},
  {p:"II 23",agric:461873,ind_ext:6935,manufactura:273682,construccion:202706,comercio:436625,restaurantes:174992,transportes:81522,serv_prof:111814,serv_soc:159670,serv_div:193501,gobierno:68584},
  {p:"III 23",agric:502834,ind_ext:9647,manufactura:266453,construccion:180132,comercio:404213,restaurantes:175434,transportes:89019,serv_prof:116830,serv_soc:169307,serv_div:230593,gobierno:81558},
  {p:"IV 23",agric:511437,ind_ext:8997,manufactura:229781,construccion:184818,comercio:456621,restaurantes:163219,transportes:83688,serv_prof:110742,serv_soc:142303,serv_div:223148,gobierno:103767},
  {p:"I 24",agric:504092,ind_ext:9293,manufactura:265084,construccion:178160,comercio:456743,restaurantes:184134,transportes:87326,serv_prof:117606,serv_soc:157532,serv_div:212240,gobierno:93553},
  {p:"II 24",agric:413577,ind_ext:5633,manufactura:315626,construccion:167732,comercio:466885,restaurantes:186668,transportes:90697,serv_prof:124156,serv_soc:157342,serv_div:215179,gobierno:98367},
  {p:"III 24",agric:406551,ind_ext:10229,manufactura:279509,construccion:167940,comercio:467432,restaurantes:184420,transportes:85468,serv_prof:131462,serv_soc:173240,serv_div:189798,gobierno:89195},
  {p:"IV 24",agric:392251,ind_ext:5431,manufactura:283808,construccion:166263,comercio:508018,restaurantes:172126,transportes:69927,serv_prof:113665,serv_soc:183030,serv_div:232632,gobierno:87629},
  {p:"I 25",agric:418674,ind_ext:7579,manufactura:287624,construccion:184990,comercio:493890,restaurantes:190067,transportes:77083,serv_prof:110432,serv_soc:177156,serv_div:194359,gobierno:79918},
  {p:"II 25",agric:387463,ind_ext:6507,manufactura:273025,construccion:203205,comercio:505614,restaurantes:188372,transportes:75596,serv_prof:112368,serv_soc:191858,serv_div:226940,gobierno:84643},
  {p:"III 25",agric:401351,ind_ext:6009,manufactura:248678,construccion:208466,comercio:540530,restaurantes:164360,transportes:64175,serv_prof:92564,serv_soc:186842,serv_div:233696,gobierno:73141},
  {p:"IV 25",agric:457377,ind_ext:6051,manufactura:231528,construccion:193505,comercio:482689,restaurantes:172729,transportes:74919,serv_prof:102107,serv_soc:179330,serv_div:235745,gobierno:83240},
];

// ─── DATOS IMSS ──────────────────────────────────────────────────────────────
const IMSS_S = [
  {p:"Ene 23",tot:374200,perm:298000,ev:76200,camp:12400,urb:63800,pH:190720,pM:107280},
  {p:"Mar 23",tot:376800,perm:299500,ev:77300,camp:13100,urb:64200,pH:191680,pM:107820},
  {p:"May 23",tot:379400,perm:301000,ev:78400,camp:14200,urb:64200,pH:192640,pM:108360},
  {p:"Jul 23",tot:381200,perm:302800,ev:78400,camp:13800,urb:64600,pH:193792,pM:109008},
  {p:"Sep 23",tot:383600,perm:304200,ev:79400,camp:13200,urb:66200,pH:194688,pM:109512},
  {p:"Nov 23",tot:385100,perm:305800,ev:79300,camp:12900,urb:66400,pH:195712,pM:110088},
  {p:"Ene 24",tot:382400,perm:304500,ev:77900,camp:12500,urb:65400,pH:194880,pM:109620},
  {p:"Mar 24",tot:386700,perm:307200,ev:79500,camp:13500,urb:66000,pH:196608,pM:110592},
  {p:"May 24",tot:389300,perm:309100,ev:80200,camp:14800,urb:65400,pH:197824,pM:111276},
  {p:"Jul 24",tot:391500,perm:310800,ev:80700,camp:14200,urb:66500,pH:198912,pM:111888},
  {p:"Sep 24",tot:393200,perm:312400,ev:80800,camp:13600,urb:67200,pH:199936,pM:112464},
  {p:"Dic 24",tot:393600,perm:313000,ev:80600,camp:13200,urb:67400,pH:200320,pM:112680},
];
const IMSS_KPI = [
  {label:"Asegurados Vigentes",valor:393600,fmt:"k",delta:"+8,500",dDir:"pos",nota:"Trabajadores IMSS activos",color:MX.vino},
  {label:"Permanentes",valor:313000,fmt:"k",delta:"+7,200",dDir:"pos",nota:"Con contrato permanente",color:MX.vinoMid},
  {label:"Eventuales",valor:80600,fmt:"k",delta:"+1,300",dDir:"pos",nota:"Eventuales urbanos + campo",color:MX.rosa},
  {label:"SBC Promedio",valor:505,fmt:"$",delta:"+5.2%",dDir:"pos",nota:"Salario Base de Cotización (dic 24)",color:MX.vino},
];

// ─── SECTORES ────────────────────────────────────────────────────────────────
const SEC_E = [
  {s:"Servicios",v:38.2,c:"#6B1737"},{s:"Comercio",v:20.1,c:"#8C2249"},
  {s:"Agropecuario",v:18.4,c:"#B03560"},{s:"Manufactura",v:11.8,c:"#C8427A"},
  {s:"Construcción",v:7.3,c:"#D96E9A"},{s:"Transporte",v:2.5,c:"#E8A0BC"},
  {s:"Gobierno",v:1.7,c:"#F2C8DA"},
];
const SEC_I = [
  {s:"Servicios",v:37.5,c:"#6B1737"},{s:"Comercio",v:24.1,c:"#8C2249"},
  {s:"Manufactura",v:18.9,c:"#B03560"},{s:"Construcción",v:11.2,c:"#C8427A"},
  {s:"Agropecuario",v:8.3,c:"#D96E9A"},
];

// ════════════════════════════════════════════════════════════════════════════
//  UTILIDADES
// ════════════════════════════════════════════════════════════════════════════
function mergeByPeriod(...arrays) {
  const map = {};
  arrays.forEach(arr => arr.forEach(row => {
    if (!map[row.p]) map[row.p] = { p: row.p };
    Object.assign(map[row.p], row);
  }));
  return Object.values(map);
}

const fmtM  = v => `${(v / 1e6).toFixed(2)}M`;
const fmtN  = v => v != null ? Math.round(v).toLocaleString("es-MX") : "";
const avg   = (arr, key) => { const v = arr.map(d => d[key]).filter(x => x != null); return v.reduce((a,b)=>a+b,0)/v.length; };

const xTickYear = value => {
  if (!value) return "";
  const [trim, yr] = value.split(" ");
  return trim === "I" ? `20${yr}` : "";
};

const axTick = (extra = {}) => ({ fontFamily: FONT, fontSize: 8, fill: MX.grayMid, ...extra });
const legFmt = v => <span style={{ fontFamily: FONT, fontSize: 10, color: MX.grayDark }}>{v}</span>;

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENTES BASE
// ════════════════════════════════════════════════════════════════════════════

function AnimNum({ target, fmt }) {
  const [n, setN] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let s = null;
    const run = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 900, 1);
      setN((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  if (fmt === "pct") return <>{n.toFixed(1)}%</>;
  if (fmt === "$")   return <>${Math.round(n).toLocaleString("es-MX")}</>;
  if (fmt === "k")   return <>{(n / 1000).toFixed(0)} k</>;
  if (fmt === "M")   return <>{(n / 1e6).toFixed(2)} M</>;
  return <>{Math.round(n).toLocaleString("es-MX")}</>;
}

// KPI Card — responsiva
function KpiCard({ label, valor, fmt, nacStr, delta, dDir, nota, color, isMobile }) {
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
        padding: isMobile ? "14px 12px" : "18px 20px",
        flex: 1,
        minWidth: 0,
        boxShadow: hov ? "0 8px 24px rgba(107,23,55,0.13)" : "0 2px 8px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all .18s ease",
      }}
    >
      <div style={{ fontSize: isMobile ? 8 : 9, fontWeight: 700, letterSpacing: isMobile ? 1 : 2, color: MX.grayMid, textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>
        <AnimNum target={valor} fmt={fmt} />
      </div>
      {nacStr && (
        <div style={{ fontSize: isMobile ? 9 : 10, color: MX.grayMid, marginBottom: 3 }}>
          Nacional: <b style={{ color: MX.grayDark }}>{nacStr}</b>
        </div>
      )}
      {delta && (
        <div style={{ fontSize: isMobile ? 9 : 10, fontWeight: 700, color: dDir === "pos" ? MX.green : "#C0392B", marginBottom: 3 }}>
          {dDir === "pos" ? "▲" : "▼"} {delta}
        </div>
      )}
      <div style={{ fontSize: 9, color: MX.grayMid, lineHeight: 1.4 }}>{nota}</div>
    </div>
  );
}

// Pills
function Pills({ options, active, onChange, isMobile }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
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
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// Sección con título + pills — responsiva
function Section({ title, sub, options, active, onChange, children, isMobile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Título + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ width: 4, height: 22, background: MX.vino, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ fontFamily: FONT, fontSize: isMobile ? 12 : 13, fontWeight: 700, color: MX.vinoDark }}>{title}</span>
          {sub && (
            <span style={{
              fontFamily: FONT, fontSize: 9, color: MX.grayMid,
              background: MX.crema, border: `1px solid ${MX.border}`,
              borderRadius: 20, padding: "2px 10px",
            }}>{sub}</span>
          )}
        </div>
        {/* Pills en línea separada en mobile */}
        {options && (
          <div style={{ paddingLeft: isMobile ? 14 : 0, overflowX: "auto", paddingBottom: 2 }}>
            <Pills options={options} active={active} onChange={onChange} isMobile={isMobile} />
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
    <div style={{
      background: MX.white,
      border: `1px solid ${MX.border}`,
      borderRadius: 10,
      padding: isMobile ? "14px 12px" : "18px 20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      ...style,
    }}>
      {title && (
        <div style={{ fontFamily: FONT, fontSize: isMobile ? 10 : 11, fontWeight: 700, color: MX.vino, marginBottom: 12, lineHeight: 1.4 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// Etiqueta pie
const PieLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
  const R = Math.PI / 180, r = outerRadius + 16;
  const x = cx + r * Math.cos(-midAngle * R), y = cy + r * Math.sin(-midAngle * R);
  if (value < 5) return null;
  return (
    <text x={x} y={y} fill={MX.grayDark} textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central" fontSize={9} fontFamily={FONT} fontWeight={600}>
      {value}%
    </text>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  GRÁFICA A — PEA vs Población Ocupada
// ════════════════════════════════════════════════════════════════════════════
function GrafPEAOcupados({ isMobile }) {
  const data = mergeByPeriod(ENOE_PEA, ENOE_S32_TOTAL);

  const TooltipPEA = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const pea  = payload.find(p => p.dataKey === "pea")?.value;
    const ocup = payload.find(p => p.dataKey === "total")?.value;
    const brech = pea != null && ocup != null ? pea - ocup : null;
    return (
      <div style={{ fontFamily: FONT, background: MX.white, border: `1px solid ${MX.border}`, borderRadius: 8, padding: "10px 12px", boxShadow: "0 4px 16px rgba(107,23,55,0.12)", fontSize: 10 }}>
        <div style={{ fontWeight: 700, color: MX.vino, marginBottom: 5 }}>{label}</div>
        <div style={{ marginBottom: 2 }}><span style={{ color: MX.grayMid }}>PEA: </span><b style={{ color: MX.vino }}>{fmtN(pea)}</b></div>
        <div style={{ marginBottom: 5 }}><span style={{ color: MX.grayMid }}>Ocupados: </span><b style={{ color: MX.rosa }}>{fmtN(ocup)}</b></div>
        {brech != null && (
          <div style={{ paddingTop: 5, borderTop: `1px solid ${MX.border}` }}>
            <span style={{ color: MX.grayMid }}>Sin empleo: </span><b style={{ color: MX.vinoMid }}>{fmtN(brech)}</b>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card title="PEA vs Población Ocupada — Michoacán" isMobile={isMobile} style={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 230}>
        <ComposedChart data={data} margin={{ left: isMobile ? 4 : 14, right: isMobile ? 4 : 14, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="grdArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={MX.vino} stopOpacity={0.10} />
              <stop offset="100%" stopColor={MX.vino} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" />
          <XAxis dataKey="p" tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} tickFormatter={xTickYear} interval={0} />
          <YAxis tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} tickFormatter={fmtM} domain={[1700000, 2450000]} width={isMobile ? 36 : 45} />
          <Tooltip content={<TooltipPEA />} />
          <Legend iconType="circle" iconSize={7} formatter={legFmt} />
          <Area type="monotone" dataKey="pea" fill="url(#grdArea)" stroke="none" legendType="none" />
          <Line type="monotone" dataKey="pea"   name="PEA"               stroke={MX.vino} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="total" name="Población Ocupada" stroke={MX.rosa} strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  GRÁFICA B — Tasas dobles
// ════════════════════════════════════════════════════════════════════════════
function GrafTasas({ isMobile }) {
  const data        = mergeByPeriod(ENOE_PART, ENOE_DESOC);
  const mediaPartic = avg(data, "part");
  const mediaDesoc  = avg(data, "desoc");

  const TooltipTasas = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ fontFamily: FONT, background: MX.white, border: `1px solid ${MX.border}`, borderRadius: 8, padding: "10px 12px", boxShadow: "0 4px 16px rgba(107,23,55,0.12)", fontSize: 10 }}>
        <div style={{ fontWeight: 700, color: MX.vino, marginBottom: 5 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ marginBottom: 2 }}>
            <span style={{ color: MX.grayMid }}>{p.name}: </span>
            <b style={{ color: p.color }}>{typeof p.value === "number" ? `${p.value.toFixed(2)}%` : p.value}</b>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card title="Tasa de Participación y Tasa de Desocupación (%)" isMobile={isMobile} style={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 230}>
        <ComposedChart data={data} margin={{ left: isMobile ? 4 : 14, right: isMobile ? 28 : 34, top: 5, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" />
          <XAxis dataKey="p" tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} tickFormatter={xTickYear} interval={0} />
          <YAxis yAxisId="L" tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} domain={[50, 65]} width={isMobile ? 28 : 36} />
          <YAxis yAxisId="R" orientation="right" tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} domain={[0, 5]} width={isMobile ? 24 : 30} />
          <Tooltip content={<TooltipTasas />} />
          <Legend iconType="circle" iconSize={7} formatter={legFmt} />
          <ReferenceLine yAxisId="L" y={mediaPartic} stroke={MX.vino} strokeDasharray="4 3" strokeOpacity={0.35} />
          <ReferenceLine yAxisId="R" y={mediaDesoc}  stroke={MX.rosa} strokeDasharray="4 3" strokeOpacity={0.35} />
          <Line yAxisId="L" type="monotone" dataKey="part"  name="T. Participación" stroke={MX.vino} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line yAxisId="R" type="monotone" dataKey="desoc" name="T. Desocupación"  stroke={MX.rosa} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  GRÁFICA C — Subsectores
// ════════════════════════════════════════════════════════════════════════════
const ETIQ = {
  agric:       "Agric. / Ganadería",
  manufactura: "Manufactura",
  construccion:"Construcción",
  ind_ext:     "Ind. Extractiva",
  comercio:    "Comercio",
  restaurantes:"Rest. y Alojamiento",
  transportes: "Transportes y Comunic.",
  serv_prof:   "Serv. Profesionales",
  serv_soc:    "Servicios Sociales",
  serv_div:    "Servicios Diversos",
  gobierno:    "Gobierno",
};

const ETIQ_FULL = {
  agric:       "Agric. / Ganadería / Silvicultura",
  manufactura: "Industria Manufacturera",
  construccion:"Construcción",
  ind_ext:     "Ind. Extractiva y Electricidad",
  comercio:    "Comercio",
  restaurantes:"Restaurantes y Alojamiento",
  transportes: "Transportes y Comunicaciones",
  serv_prof:   "Serv. Profesionales y Financieros",
  serv_soc:    "Servicios Sociales",
  serv_div:    "Servicios Diversos",
  gobierno:    "Gobierno",
};

function GrafSubsectores({ isMobile }) {
  const periodos  = ENOE_S32_SUBSECTORES.map(d => d.p);
  const años      = [...new Set(periodos.map(p => p.split(" ")[1]))];
  const trimestres = ["I", "II", "III", "IV"];

  const lastP  = periodos[periodos.length - 1].split(" ");
  const [trim, setTrim] = useState(lastP[0]);
  const [anio, setAnio] = useState(lastP[1]);

  const perKey = `${trim} ${anio}`;
  const periodoValido = periodos.includes(perKey) ? perKey : periodos[periodos.length - 1];

  const row     = ENOE_S32_SUBSECTORES.find(d => d.p === periodoValido) || {};
  const etiqMap = isMobile ? ETIQ : ETIQ_FULL;
  const barData = Object.keys(etiqMap)
    .map(k => ({ label: etiqMap[k], val: row[k] ?? 0 }))
    .sort((a, b) => b.val - a.val);

  const barColor = i => i < 3 ? MX.vino : i < 7 ? MX.rosa : MX.neutral;

  const selectStyle = {
    fontFamily: FONT, fontSize: 10, fontWeight: 600, cursor: "pointer",
    padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${MX.vino}`,
    color: MX.vino, background: MX.crema, outline: "none", appearance: "none",
    WebkitAppearance: "none", paddingRight: 24,
  };

  const TooltipSub = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ fontFamily: FONT, background: MX.white, border: `1px solid ${MX.border}`, borderRadius: 8, padding: "10px 12px", boxShadow: "0 4px 16px rgba(107,23,55,0.12)", fontSize: 10 }}>
        <div style={{ fontWeight: 700, color: MX.vino, marginBottom: 4 }}>{label}</div>
        <b style={{ color: MX.grayDark }}>{fmtN(payload[0]?.value)}</b> personas
      </div>
    );
  };

  // Altura dinámica según mobile
  const chartH = isMobile ? 340 : 380;
  const yAxisW = isMobile ? 110 : 210;
  const labelFontSize = isMobile ? 8 : 9;

  return (
    <Card isMobile={isMobile} style={{ width: "100%" }}>
      {/* Encabezado con selectores */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: FONT, fontSize: isMobile ? 10 : 11, fontWeight: 700, color: MX.vino, lineHeight: 1.4 }}>
          Ocupación por Sector de Actividad Económica — Michoacán
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Selector Trimestre */}
          <div style={{ position: "relative" }}>
            <select value={trim} onChange={e => setTrim(e.target.value)} style={selectStyle}>
              {trimestres.map(t => (
                <option key={t} value={t}>{t === "I" ? "I Trim." : t === "II" ? "II Trim." : t === "III" ? "III Trim." : "IV Trim."}</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: MX.vino, fontSize: 9 }}>▾</span>
          </div>
          {/* Selector Año */}
          <div style={{ position: "relative" }}>
            <select value={anio} onChange={e => setAnio(e.target.value)} style={selectStyle}>
              {años.map(a => <option key={a} value={a}>20{a}</option>)}
            </select>
            <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: MX.vino, fontSize: 9 }}>▾</span>
          </div>
          {!periodos.includes(perKey) && (
            <span style={{ fontFamily: FONT, fontSize: 9, color: MX.rosa }}>
              No disponible — mostrando {periodoValido}
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartH}>
        <BarChart data={barData} layout="vertical" margin={{ left: 4, right: isMobile ? 52 : 80, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" horizontal={false} />
          <XAxis type="number" tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
          <YAxis
            type="category"
            dataKey="label"
            tick={axTick({ fontSize: labelFontSize })}
            axisLine={false}
            tickLine={false}
            width={yAxisW}
          />
          <Tooltip content={<TooltipSub />} />
          <Bar dataKey="val" name="Ocupados" radius={[0, 4, 4, 0]}>
            {barData.map((_, i) => <Cell key={i} fill={barColor(i)} />)}
            <LabelList
              dataKey="val"
              position="right"
              style={{ fontFamily: FONT, fontSize: labelFontSize, fill: MX.grayDark, fontWeight: 600 }}
              formatter={v => isMobile ? `${(v/1000).toFixed(0)}k` : fmtN(v)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TAB ENOE
// ════════════════════════════════════════════════════════════════════════════
function TabENOE({ isMobile }) {
  const [secFL,  setSecFL]  = useState("pea");
  const [secDin, setSecDin] = useState("sectores");

  const lastPEA   = ENOE_PEA[ENOE_PEA.length - 1];
  const lastOcup  = ENOE_S32_TOTAL[ENOE_S32_TOTAL.length - 1];
  const lastPart  = ENOE_PART[ENOE_PART.length - 1];
  const lastDesoc = ENOE_DESOC[ENOE_DESOC.length - 1];

  const KPIs = [
    { label: "PEA",              valor: lastPEA.pea,     fmt: "M",   nacStr: "61.2 M", color: MX.vino,    nota: "Pob. Económicamente Activa (IV 25)" },
    { label: "T. Participación", valor: lastPart.part,   fmt: "pct", nacStr: "60.2%",  color: MX.vinoMid, nota: "% de la PET en el mercado laboral" },
    { label: "T. Desocupación",  valor: lastDesoc.desoc, fmt: "pct", nacStr: "2.7%",   color: MX.rosa,    nota: "% de la PEA desocupada" },
    { label: "Pob. Ocupada",     valor: lastOcup.total,  fmt: "M",   nacStr: "—",      color: MX.vino,    nota: "Ocupados totales S32 (IV 25)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 18 : 24 }}>
      {/* KPI Cards — 2x2 en mobile, 4 en fila en desktop */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: isMobile ? 10 : 14,
      }}>
        {KPIs.map((k, i) => <KpiCard key={i} {...k} isMobile={isMobile} />)}
      </div>

      <Section
        title="Fuerza Laboral"
        sub="ENOE Trimestral 2016–2025"
        options={[
          { id: "pea",   label: "PEA vs Ocupados" },
          { id: "tasas", label: "Participación y Desocupación" },
        ]}
        active={secFL}
        onChange={setSecFL}
        isMobile={isMobile}
      >
        {secFL === "pea"   && <GrafPEAOcupados isMobile={isMobile} />}
        {secFL === "tasas" && <GrafTasas isMobile={isMobile} />}
      </Section>

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

      <div style={{ fontFamily: FONT, fontSize: 9, color: MX.grayMid, textAlign: "right" }}>
        Fuente: ENOE (INEGI) · data.inegi.org.mx · 2016–2025 (II 2020 excluido: ETOE)
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TAB IMSS
// ════════════════════════════════════════════════════════════════════════════
function TabIMSS({ isMobile }) {
  const [g1, setG1] = useState("tot");
  const [g2, setG2] = useState("ev");

  const G1 = {
    tot:  { title: "Total de Puestos de Trabajo Asegurados", lines: [{ key: "tot",  name: "Total",       color: MX.vino    }], domain: [365000, 400000] },
    perm: { title: "Trabajadores Permanentes",               lines: [{ key: "perm", name: "Permanentes", color: MX.vinoMid }], domain: [290000, 320000] },
    ev:   { title: "Trabajadores Eventuales",                lines: [{ key: "ev",   name: "Eventuales",  color: MX.rosa    }], domain: [70000,  90000]  },
    comp: { title: "Permanentes vs Eventuales",              domain: [0, 350000],
      lines: [{ key: "perm", name: "Permanentes", color: MX.vino }, { key: "ev", name: "Eventuales", color: MX.rosa }] },
  };
  const G2 = {
    ev:   { title: "Eventuales del Campo vs Urbanos",  lines: [{ key: "urb",  name: "Eventuales Urbanos",   color: MX.vino }, { key: "camp", name: "Eventuales del Campo", color: MX.rosa, dash: "5 3" }] },
    perm: { title: "Permanentes · Hombres vs Mujeres", lines: [{ key: "pH",   name: "Hombres",              color: MX.vino }, { key: "pM",   name: "Mujeres",              color: MX.rosa, dash: "5 3" }] },
  };
  const c1 = G1[g1], c2 = G2[g2];
  const chartH = isMobile ? 190 : 210;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 18 : 24 }}>
      {/* KPI Cards 2x2 en mobile */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: isMobile ? 10 : 14,
      }}>
        {IMSS_KPI.map((k, i) => <KpiCard key={i} {...k} isMobile={isMobile} />)}
      </div>

      <Section
        title="Puestos de Trabajo"
        sub="IMSS Mensual 2023–2024"
        options={[
          { id:"tot",  label:"Total"       },
          { id:"perm", label:"Permanentes" },
          { id:"ev",   label:"Eventuales"  },
          { id:"comp", label:"Comparativo" },
        ]}
        active={g1}
        onChange={setG1}
        isMobile={isMobile}
      >
        <Card title={c1.title} isMobile={isMobile} style={{ width: "100%" }}>
          <ResponsiveContainer width="100%" height={chartH}>
            <LineChart data={IMSS_S} margin={{ left: isMobile ? 4 : 14, right: isMobile ? 4 : 20, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" />
              <XAxis dataKey="p" tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} interval={isMobile ? 2 : 1} />
              <YAxis tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} domain={c1.domain} width={isMobile ? 30 : 40} />
              <Tooltip formatter={v => [fmtN(v), ""]} />
              {c1.lines.length > 1 && <Legend iconType="circle" iconSize={7} formatter={legFmt} />}
              {c1.lines.map(l => (
                <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5} dot={{ r: 3, fill: l.color }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <Section
        title="Desglose detallado"
        sub=""
        options={[
          { id:"ev",   label:"Eventuales · Campo vs Urbano"     },
          { id:"perm", label:"Permanentes · Hombres vs Mujeres" },
        ]}
        active={g2}
        onChange={setG2}
        isMobile={isMobile}
      >
        <Card title={c2.title} isMobile={isMobile} style={{ width: "100%" }}>
          <ResponsiveContainer width="100%" height={chartH}>
            <LineChart data={IMSS_S} margin={{ left: isMobile ? 4 : 14, right: isMobile ? 4 : 20, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" />
              <XAxis dataKey="p" tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} interval={isMobile ? 2 : 1} />
              <YAxis tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={isMobile ? 30 : 40} />
              <Tooltip formatter={v => [fmtN(v), ""]} />
              <Legend iconType="circle" iconSize={7} formatter={legFmt} />
              {c2.lines.map(l => (
                <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5} dot={{ r: 3, fill: l.color }} activeDot={{ r: 5 }} strokeDasharray={l.dash || "0"} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <div style={{ fontFamily: FONT, fontSize: 9, color: MX.grayMid, textAlign: "right" }}>
        Fuente: IMSS CUBOS · imss.gob.mx · Datos ilustrativos
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TAB SECTORES
// ════════════════════════════════════════════════════════════════════════════
function TabSectores({ isMobile }) {
  const [pie, setPie] = useState("enoe");
  const [bar, setBar] = useState("enoe");
  const pieData = pie === "enoe" ? SEC_E : SEC_I;
  const barData = bar === "enoe" ? SEC_E : SEC_I;
  const pieR    = isMobile ? 80 : 100;
  const pieH    = isMobile ? 210 : 250;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 18 : 24 }}>
      <Section
        title="Distribución por sector"
        sub="Comparativo ENOE · IMSS"
        options={[{ id:"enoe", label:"Vista ENOE" }, { id:"imss", label:"Vista IMSS" }]}
        active={pie}
        onChange={setPie}
        isMobile={isMobile}
      >
        <Card
          title={pie === "enoe" ? "ENOE — Ocupados por sector (% del total)" : "IMSS — Asegurados por sector (% del total)"}
          isMobile={isMobile}
          style={{ width: "100%" }}
        >
          {/* En mobile: pie arriba, leyenda abajo */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 32, alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: isMobile ? "100%" : 310 }}>
              <ResponsiveContainer width="100%" height={pieH}>
                <PieChart>
                  <Pie data={pieData} dataKey="v" nameKey="s" cx="50%" cy="50%" outerRadius={pieR} paddingAngle={2} label={<PieLabel />} labelLine={false}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.c} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Leyenda */}
            <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", flexWrap: "wrap", gap: isMobile ? "8px 16px" : 10, justifyContent: isMobile ? "center" : "flex-start" }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.c, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT, fontSize: 10, color: MX.grayDark, fontWeight: 600 }}>{d.s}</span>
                  <span style={{ fontFamily: FONT, fontSize: 10, color: MX.grayMid }}>{d.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      <Section
        title="Comparativo en barras"
        sub=""
        options={[{ id:"enoe", label:"Vista ENOE" }, { id:"imss", label:"Vista IMSS" }]}
        active={bar}
        onChange={setBar}
        isMobile={isMobile}
      >
        <Card
          title={bar === "enoe" ? "ENOE — Ocupados por sector (%)" : "IMSS — Asegurados por sector (%)"}
          isMobile={isMobile}
          style={{ width: "100%" }}
        >
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 230}>
            <BarChart data={barData} margin={{ left: 0, right: isMobile ? 10 : 20, top: 10, bottom: isMobile ? 24 : 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E8EC" vertical={false} />
              <XAxis dataKey="s" tick={axTick({ fontSize: isMobile ? 8 : 10 })} axisLine={false} tickLine={false} angle={isMobile ? -30 : 0} textAnchor={isMobile ? "end" : "middle"} interval={0} />
              <YAxis tick={axTick({ fontSize: isMobile ? 7 : 8 })} axisLine={false} tickLine={false} unit="%" domain={[0, 45]} width={isMobile ? 24 : 32} />
              <Tooltip formatter={v => [`${v}%`, ""]} />
              <Bar dataKey="v" name="Participación" radius={[5, 5, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.c} />)}
                <LabelList dataKey="v" position="top" style={{ fontFamily: FONT, fontSize: isMobile ? 9 : 10, fill: MX.grayDark, fontWeight: 700 }} formatter={v => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <div style={{ fontFamily: FONT, fontSize: 9, color: MX.grayMid, textAlign: "right" }}>
        Fuentes: ENOE (INEGI) · IMSS CUBOS · Datos ilustrativos
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  APP PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("enoe");
  const width   = useWindowWidth();
  const isMobile = width <= 430;
  const px = isMobile ? 16 : 36;

  return (
    <div style={{ minHeight: "100vh", background: MX.grayLt, fontFamily: FONT, color: MX.grayDark }}>
      {/* HEADER */}
      <div style={{
        background: MX.white,
        borderBottom: `3px solid ${MX.vino}`,
        padding: isMobile ? "12px 16px" : "14px 36px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        gap: isMobile ? 8 : 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isMobile ? 8 : 9, fontWeight: 700, letterSpacing: isMobile ? 1.5 : 3, color: MX.rosa, textTransform: "uppercase", marginBottom: 3 }}>
            Secretaría de Desarrollo Económico · Michoacán es Mejor
          </div>
          <div style={{ fontSize: isMobile ? 15 : 19, fontWeight: 700, color: MX.vinoDark, lineHeight: 1.2 }}>
            Dashboard de Indicadores Laborales
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 8, color: MX.grayMid, marginBottom: 3 }}>Último período</div>
          <div style={{
            fontSize: isMobile ? 10 : 11,
            fontWeight: 700,
            color: MX.vino,
            background: MX.crema,
            border: `1px solid ${MX.border}`,
            borderRadius: 6,
            padding: isMobile ? "4px 10px" : "4px 14px",
            textAlign: "center",
          }}>
            IV Trim. 2025
          </div>
        </div>
      </div>

      {/* TABS PRINCIPALES — scroll horizontal en mobile */}
      <div style={{
        background: MX.white,
        borderBottom: `1px solid ${MX.border}`,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        display: "flex",
        paddingLeft: isMobile ? 0 : 36,
      }}>
        <style>{`.tab-scroll::-webkit-scrollbar { display: none; }`}</style>
        {NAV.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: FONT,
            background: "transparent",
            border: "none",
            borderBottom: tab === t.id ? `3px solid ${MX.vino}` : "3px solid transparent",
            padding: isMobile ? "10px 16px" : "12px 22px",
            cursor: "pointer",
            transition: "all .15s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? MX.vino : MX.grayMid, whiteSpace: "nowrap" }}>
              {t.label}
            </span>
            <span style={{ fontSize: 9, color: tab === t.id ? MX.rosa : "#ccc", whiteSpace: "nowrap" }}>
              {t.sub}
            </span>
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: isMobile ? "16px 16px 32px" : "24px 36px" }}>
        {tab === "enoe"     && <TabENOE     isMobile={isMobile} />}
        {tab === "imss"     && <TabIMSS     isMobile={isMobile} />}
        {tab === "sectores" && <TabSectores isMobile={isMobile} />}
      </div>
    </div>
  );
}
