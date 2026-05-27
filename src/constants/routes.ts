export const APP_ROUTES = {
  home: "/",
  homeApp: "/home-app",
  login: "/inicio-sesion",
  registro: "/registro-usuario",
  registroEmpresa: "/registro-empresa",
  caracterizacion: "/caracterizacion-residuos",
  autodiagnostico: "/autodiagnostico-detallado",
  evaluacionConocimiento: "/evaluacion-conocimiento-diagnostico",
  evaluacionClasificacion: "/evaluacion-clasificacion-aprovechamiento",
  planAccionKpis: "/plan-accion-kpis",
  evaluacionAlianzas: "/evaluacion-alianzas-seguimiento",
  vinculacionAliados: "/vinculacion-aliados",
  matrizSeguimiento: "/matriz-seguimiento",
  historial: "/historial",
  analisis: "/analisis",
  analisisComparar: "/analisis/comparar",
} as const;

export type MainNavLink = {
  label: string;
  href: string;
  active?: boolean;
};

export const MAIN_NAV_LINKS: MainNavLink[] = [
  { label: "Dashboard", href: "#" },
  { label: "Autodiagnóstico", href: "#", active: true },
  { label: "Insights", href: "#" },
  { label: "Aliados", href: "#" },
];
