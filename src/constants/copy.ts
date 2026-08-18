export const LANDING_COPY = {
  badge: "",
  brand: "EcoRuta Textil",
  title: "Hoja de Ruta: Aprovechamiento de Residuo Textil",
  description:
    "Herramienta de autoevaluación para MiPymes del sector textil orientada a la economía circular.",
  ctaPrimary: "Comenzar autodiagnóstico",
  ctaSecondary: "Ver guía de usuario",
  nav: ["Assess", "Insights", "Allies", "Profile"],
  pathwayCenterTitle: "APROVECHAMIENTO TEXTIL",
  pathwayCenterSubtitle: "ECONOMÍA CIRCULAR",
  pathwaySegments: [
    "1. Upcycling",
    "2. Reciclaje Mecánico",
    "3. Estrategia Comercial",
    "4. Donación / Reventa",
  ],
  methodologyTitle: "Nuestra Metodología",
  methodologyDescription:
    "Un proceso de 5 pasos diseñado para la optimización de recursos.",
  methodologySteps: [
    {
      step: "01",
      title: "Autodiagnóstico",
      description:
        "Evaluación inicial de procesos internos y flujos de residuos actuales.",
    },
    {
      step: "02",
      title: "Caracterización",
      description:
        "Análisis detallado de tipos de textiles y potencial de aprovechamiento.",
    },
    {
      step: "03",
      title: "Plan de Acción",
      description:
        "Definición de KPIs y estrategias de economía circular para cada empresa.",
    },
    {
      step: "04",
      title: "Aliados",
      description:
        "Conexión con gestores autorizados y socios para valorización de residuos.",
    },
  ],
};

export const PLATFORM_COPY = {
  brand: "EcoRuta Textil",
  company: "MiPyme Textil",
  topNav: ["Dashboard", "Autodiagnóstico", "Insights", "Aliados"],
  sideNav: ["Dashboard", "Autodiagnóstico", "Insights", "Aliados", "Historial"],
  sideBottom: ["Configuración", "Ayuda"],
  historyButton: "Historial",
  ctaStart: "Iniciar Diagnóstico",
  footer: {
    copyright: "© 2026 EcoRuta Textil - Alianza Estratégica para la Economía Circular",
    links: ["Privacidad", "Términos de Uso", "Educativo"],
  },
};

export const HISTORIAL_COPY = {
  title: "Historial de solicitudes",
  subtitle: "Solicitudes en proceso",
  tableHeaders: {
    requestNumber: "N° de solicitud",
    clientName: "Nombre del cliente",
    updatedAt: "Última actualización",
    status: "Estado",
    actions: "Acciones",
  },
  statusComplete: "completado",
  statusInProgress: "Pendiente",
  continueButton: "Continuar",
  viewAnalysisButton: "Ver análisis",
  emptyTitle: "Todavía no tienes solicitudes en proceso",
  emptyDescription:
    "Cuando registres una empresa y avances en el flujo, aparecerá aquí el estado de cada solicitud.",
  authRequired: "Necesitas iniciar sesión para ver el historial.",
  fallbackDate: "Sin fecha",
};

export const ANALISIS_COPY = {
  title: "Análisis de solicitud",
  subtitle: "Resumen ejecutivo",
  printAction: "Imprimir / Guardar PDF",
  backToHistory: "Volver al historial",
  noContext: "No se encontró la solicitud solicitada.",
  noConclusion: "Sin conclusión registrada.",
  metrics: {
    maturity: "Madurez del diagnóstico",
    totalWaste: "Residuos totales (kg/mes)",
    recoverableWaste: "Aprovechable (kg/mes)",
    avgKpi: "Cumplimiento promedio KPI",
  },
  sections: {
    conclusions: "Conclusiones clave",
    strategyMix: "Distribución por estrategia",
    planSummary: "Resumen del plan de acción",
  },
  labels: {
    request: "Solicitud",
    company: "Empresa",
    city: "Ciudad",
    createdAt: "Fecha de registro",
    highPriority: "Acciones alta prioridad",
    closed: "Acciones cerradas",
    atRisk: "Acciones en riesgo",
  },
};

export const LOGIN_COPY = {
  brand: "EcoRuta Textil",
  title: "Bienvenido de nuevo",
  subtitle: "Accede a tu portal de economía circular para MiPymes.",
  email: "Correo electrónico",
  password: "Contraseña",
  emailPlaceholder: "ejemplo@empresa.com",
  passwordPlaceholder: "••••••••",
  remember: "Recuérdame",
  forgot: "¿Olvidaste tu contraseña?",
  submit: "Iniciar sesión",
  submitLoading: "Ingresando...",
  loginSuccess: "Inicio de sesión exitoso. Redirigiendo...",
  divider: "o continúa con",
  noAccount: "¿No tienes cuenta?",
  register: "Regístrate",
  authErrorFallback:
    "No fue posible iniciar sesión. Revisa tus credenciales e intenta nuevamente.",
  requiredFields: "Completa correo y contraseña.",
};

export const FORM_COMMON_COPY = {
  submit: "Guardar y continuar",
  back: "Atrás",
  next: "Siguiente",
};

export const SIGNUP_COPY = {
  brand: "EcoRuta Textil",
  title: "Crea tu cuenta",
  subtitle: "Regístrate para acceder a la hoja de ruta de economía circular.",
  email: "Correo electrónico",
  password: "Contraseña",
  confirmPassword: "Confirmar contraseña",
  emailPlaceholder: "ejemplo@empresa.com",
  passwordPlaceholder: "••••••••",
  confirmPasswordPlaceholder: "••••••••",
  submit: "Crear cuenta",
  submitLoading: "Creando cuenta...",
  requiredFields: "Completa correo, contraseña y confirmación.",
  passwordMismatch: "Las contraseñas no coinciden.",
  successEmailConfirmation:
    "Cuenta creada con éxito. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.",
  successDirect: "Cuenta creada con éxito. Ya puedes iniciar sesión.",
  authErrorFallback: "No fue posible crear la cuenta. Intenta nuevamente.",
  alreadyHaveAccount: "¿Ya tienes cuenta?",
  loginLink: "Iniciar sesión",
};

export const FORGOT_COPY = {
  brand: "EcoRuta Textil",
  title: "Recuperar contraseña",
  subtitle: "Ingresa tu correo y te enviaremos las instrucciones para restablecer tu contraseña.",
  email: "Correo electrónico",
  emailPlaceholder: "ejemplo@empresa.com",
  submit: "Enviar instrucciones",
  submitLoading: "Enviando...",
  success: "Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.",
  error: "No fue posible enviar el correo. Verifica tu dirección e intenta nuevamente.",
  requiredFields: "Completa tu correo electrónico.",
  backToLogin: "Volver al inicio de sesión",
};

export const UPDATE_PASSWORD_COPY = {
  brand: "EcoRuta Textil",
  title: "Nueva contraseña",
  subtitle: "Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.",
  password: "Nueva contraseña",
  confirmPassword: "Confirmar contraseña",
  passwordPlaceholder: "••••••••",
  confirmPasswordPlaceholder: "••••••••",
  submit: "Restablecer contraseña",
  submitLoading: "Restableciendo...",
  success: "Contraseña restablecida con éxito. Ya puedes iniciar sesión.",
  error: "No fue posible restablecer la contraseña. El enlace puede haber expirado.",
  requiredFields: "Completa ambos campos.",
  passwordMismatch: "Las contraseñas no coinciden.",
  backToLogin: "Ir al inicio de sesión",
  invalidToken: "El enlace de recuperación no es válido o expiró. Solicita uno nuevo.",
};

export const HOME_DASHBOARD_COPY = {
  title: "Hoja de Ruta: Aprovechamiento de Residuo Textil",
  description:
    "Esta herramienta de autoevaluación orienta a las MiPyMEs del sector textil en la identificación de oportunidades para el aprovechamiento de residuos textiles.",
  ctaPrimary: "Comenzar autodiagnóstico",
  ctaSecondary: "Ver guía de usuario",
  centerTitle: "APROVECHAMIENTO TEXTIL",
  centerSubtitle: "ECONOMÍA CIRCULAR",
  ringSegments: ["1. Upcycling", "2. Reciclaje Mecánico", "3. Estrategia Comercial", "4. Donación / Reventa"],
};

export const REGISTRO_EMPRESA_COPY = {
  stepLabel: "Etapa 1 de 4",
  title: "Datos de la compañía",
  progress: "25% completado",
  intro:
    "Para comenzar la transformación circular de su empresa, necesitamos conocer la información básica de su operación.",
  fields: {
    companyName: "Nombre empresa",
    employeeCount: "Número de empleados",
    size: "Tamaño de la empresa",
    address: "Dirección",
    city: "Ciudad / Municipio",
    wasteManager: "Responsable del aprovechamiento de residuos textiles",
    phone: "Teléfono de contacto",
    role: "Cargo",
  },
  sizeValues: {
    small: "Pequeña",
    medium: "Mediana",
    large: "Grande",
  },
  draft: "Guardar borrador",
  next: "Continuar al paso 1: Autodiagnóstico",
  requiredFieldsError: "Completa todos los campos obligatorios.",
  invalidEmployeeCountError: "Ingresa un número de empleados válido.",
  submitLoading: "Registrando...",
  submitSuccess: "Solicitud creada con éxito.",
  requestNumberLabel: "Número de solicitud",
  submitErrorFallback: "No se pudo guardar el registro. Intenta nuevamente.",
  companyContextStorageKey: "company-context",
};

export const AUTODIAGNOSTICO_COPY = {
  stepLabel: "Paso 1 de 5",
  title: "Autodiagnóstico detallado",
  progress: "20% completado",
  objective:
    "Evaluar el nivel de madurez de la MiPyME frente al aprovechamiento de residuos textiles",
  instructions: "Califique cada dimensión en una escala de 1 a 5.",
  weightRule: "El peso por dimensión es editable, sin decimales. La suma total debe ser 100%.",
  headers: {
    dimension: "Dimensión",
    criteria: "Criterio / pregunta guía",
    weight: "Peso (%)",
    score: "Calificación (1-5)",
    weightedResult: "Resultado ponderado",
    gap: "Brecha",
    level: "Nivel",
    recommendation: "Recomendación automática",
  },
  dimensions: [
    {
      key: "knowledge",
      name: "Gestión de conocimiento",
      criteria:
        "¿Su empresa cuenta con conocimientos documentados y formación sobre economía circular y residuos textiles?",
      weight: 15,
    },
    {
      key: "waste",
      name: "Gestión de residuos",
      criteria:
        "¿Existe separación, clasificación y manejo sistemático de residuos textiles en la operación diaria?",
      weight: 15,
    },
    {
      key: "internal-processes",
      name: "Procesos internos",
      criteria:
        "¿Los procesos internos incorporan lineamientos y responsabilidades para prevenir y aprovechar residuos textiles?",
      weight: 15,
    },
    {
      key: "circular-use",
      name: "Aprovechamiento circular",
      criteria:
        "¿La empresa implementa estrategias de reutilización, transformación o valorización de residuos textiles?",
      weight: 15,
    },
    {
      key: "alliances",
      name: "Alianzas y articulación",
      criteria:
        "¿Se han establecido alianzas con actores externos para fortalecer el aprovechamiento de residuos textiles?",
      weight: 10,
    },
    {
      key: "tracking",
      name: "Seguimiento e indicadores",
      criteria:
        "¿Se miden resultados con indicadores y se hace seguimiento periódico a las metas de aprovechamiento?",
      weight: 10,
    },
    {
      key: "social-impact",
      name: "Impacto social",
      criteria:
        "¿Las acciones de aprovechamiento textil generan beneficios sociales para colaboradores, comunidad o aliados?",
      weight: 10,
    },
    {
      key: "environmental-impact",
      name: "Impacto ambiental",
      criteria:
        "¿Las acciones implementadas reducen impactos ambientales y promueven prácticas sostenibles medibles?",
      weight: 10,
    },
  ],
  levels: {
    initial: "Inicial",
    intermediate: "En desarrollo",
    advanced: "Avanzado",
  },
  recommendations: {
    initial: "Priorizar acciones básicas y responsables internos",
    intermediate: "Fortalecer controles, alianzas e indicadores",
    advanced: "Mantener y escalar buenas prácticas",
  },
  summary: {
    totalWeighted: "Calificación del autodiagnóstico",
    maturityPercent: "% Madurez",
    maturityLevel: "Nivel de madurez",
    weakestDimension: "Dimensión más débil",
    biggestGap: "Mayor brecha",
    conclusion: "Conclusión",
    noWeakDimension: "Aún sin datos",
  },
  actions: {
    back: "Atrás",
    saveContinue: "Guardar y continuar",
  },
  submit: {
    saving: "Guardando diagnóstico...",
    companyContextMissing:
      "No encontramos los datos de la empresa de la etapa anterior. Vuelve a registro de empresa y guarda nuevamente.",
    saveError: "No se pudo guardar el diagnóstico. Intenta nuevamente.",
  },
  weightValidation: {
    totalLabel: "Suma de pesos",
    invalid: "La suma de pesos debe ser exactamente 100% para continuar.",
  },
  conclusionByLevel: {
    pending:
      "Complete la calificación del diagnóstico para generar la interpretación.",
    initial:
      "La empresa se encuentra en una etapa inicial. Se recomienda iniciar con identificación, separación y registro básico de residuos textiles.",
    intermediate:
      "La empresa está en transición. Debe consolidar procesos, responsables, alianzas e indicadores para escalar el aprovechamiento.",
    advanced:
      "La empresa presenta una madurez avanzada. Puede enfocarse en innovación, medición de impacto y escalamiento de soluciones circulares.",
  },
};

export const CARACTERIZACION_COPY = {
  stepLabel: "Paso 2 de 5",
  title: "Caracterización de Residuos",
  totalProgressLabel: "PROGRESO TOTAL",
  totalProgressValue: "40%",
  inventoryTitle: "Inventario de Residuos y Potencial de Aprovechamiento",
  instructions:
    "Registra las etapas del proceso productivo en las que se hayan identificado residuos textiles, indicando cantidades generadas y potencialmente aprovechables. El porcentaje de aprovechamiento se calcula automáticamente.",
  addRow: "Agregar fila",
  deleteRow: "Eliminar fila",
  headers: {
    etapa_generacion: "ETAPA",
    tipo_residuo: "TIPO RESIDUO",
    material: "MATERIAL",
    cantidad_residuos_kg_mes: "CANT. RESIDUOS (KG/MES)",
    cantidad_aprovechable_kg_mes: "CANT. APROVECHABLE (KG/MES)",
    porcentaje_aprovechable: "% APROVECHABLE",
    estrategia: "ESTRATEGIA",
    potencial: "POTENCIAL",
    observaciones: "OBSERVACIONES",
    acciones: "ACCIONES",
  },
  summary: {
    totalResiduos: "Total residuos",
    totalAprovechable: "Total aprovechable",
    totalPorcentaje: "Porcentaje total aprovechable",
    strategyTotals: "Totales por estrategia",
    automaticConclusion: "Conclusión",
    noStrategyData: "Sin datos de estrategia",
  },
  fields: {
    etapaPlaceholder: "Selecciona una etapa",
    tipoResiduoPlaceholder: "Selecciona un tipo de residuo",
    materialPlaceholder: "Selecciona un material",
    estrategiaPlaceholder: "Ej. Reutilización interna",
    potencialPlaceholder: "Ej. Alto",
    observacionesPlaceholder: "Observaciones",
  },
  selects: {
    etapaDefaultOption: "Selecciona una etapa",
    tipoDefaultOption: "Selecciona un tipo",
    materialDefaultOption: "Selecciona un material",
  },
  actions: {
    back: "Atrás",
    saveContinue: "Guardar y continuar",
  },
  submit: {
    saving: "Guardando caracterización...",
    authRequired: "Tu sesión expiró. Iniciá sesión nuevamente para guardar la caracterización.",
    companyContextMissing:
      "No encontramos los datos de la empresa o solicitud. Vuelve al paso anterior y guarda nuevamente.",
    saveError: "No se pudo guardar la caracterización. Intenta nuevamente.",
  },
  initialRows: [
    {
      etapa_generacion: "Corte",
      tipo_residuo: "Retal pequeño",
      material: "Algodón 100%",
      cantidad_residuos_kg_mes: 120,
      cantidad_aprovechable_kg_mes: 85,
      estrategia: "Reutilización interna",
      potencial: "Alto",
      observaciones: "Se usa para prototipos y muestras.",
    },
    {
      etapa_generacion: "Confección",
      tipo_residuo: "Hilo sobrante",
      material: "Mezcla algodón-poliéster",
      cantidad_residuos_kg_mes: 45,
      cantidad_aprovechable_kg_mes: 18,
      estrategia: "Reciclaje externo",
      potencial: "Medio",
      observaciones: "Se entrega a gestor aliado mensualmente.",
    },
  ],
};

export const EVAL_CONOCIMIENTO_COPY = {
  stepLabel: "Paso 2 de 4",
  title: "Diagnóstico Operativo",
  progress: "45% completado",
  question:
    "¿Qué tan familiarizado está su equipo directivo con los principios de la Economía Circular?",
  left: "Nulo / Muy Bajo",
  right: "Experto / Referente",
};

export const EVAL_CLASIFICACION_COPY = {
  stepLabel: "Fase 3: Clasificación y Aprovechamiento",
  title: "Evaluación de Gestión",
  subtitle:
    "Analicemos cómo clasifica su empresa los residuos textiles y qué procesos de recuperación está implementando actualmente.",
  question: "¿Cómo califica su actual sistema de separación en la fuente?",
  options: ["Deficiente", "Básico", "Estandarizado", "Avanzado"],
};

export const PLAN_ACCION_KPIS_COPY = {
  stepLabel: "Paso 3 de 5",
  title: "Plan de acción y seguimiento de KPIs",
  progress: "60% completado",
  objective:
    "Convertir el diagnóstico en acciones priorizadas, responsables, metas e indicadores de seguimiento para la hoja de ruta de aprovechamiento de residuos textiles.",
  actionsTitle: "Tabla de acciones priorizadas",
  kpisTitle: "Tabla de indicadores (KPI)",
  summaryTitle: "Resumen de seguimiento",
  headers: {
    fase: "Fase",
    accion: "Acción",
    responsable: "Responsable",
    fechaInicio: "Fecha inicio",
    fechaFin: "Fecha fin",
    impacto: "Impacto (1-5)",
    esfuerzo: "Esfuerzo (1-5)",
    indicePrioridad: "Índice prioridad",
    prioridad: "Prioridad",
    estado: "Estado",
    indicador: "Indicador",
    actual: "Actual",
    meta: "Meta",
    cumplimiento: "% Cumplimiento",
    acciones: "Acciones",
  },
  estados: ["No iniciado", "En planeación", "En ejecución", "En riesgo", "En pausa", "Cerrado", "Cancelado"],
  priorities: {
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  },
  summary: {
    altaPrioridad: "Acciones alta prioridad",
    cerradas: "Acciones cerradas",
    riesgo: "Acciones en riesgo",
    promedioKpi: "Cumplimiento promedio KPI",
    estadoGeneral: "Estado general",
    estadoDefault: "En seguimiento",
  },
  submit: {
    saving: "Guardando plan de acción...",
    authRequired: "Tu sesión expiró. Iniciá sesión nuevamente para guardar el plan.",
    companyContextMissing:
      "No encontramos los datos de la empresa o solicitud. Vuelve al paso anterior y guarda nuevamente.",
    saveError: "No se pudo guardar el plan de acción y KPIs. Intenta nuevamente.",
  },
  actions: {
    back: "Atrás",
    saveContinue: "Guardar y continuar",
    addRow: "Agregar fila",
    deleteRow: "Eliminar fila",
  },
  initialActionRows: [
    {
      fase: "Gestión de conocimiento",
      accion:
        "Capacitar al equipo de producción, compras u operaciones en aprovechamiento de residuos textiles. Capacitación que pueden recibir de entidades como el SENA o la CAR",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      impacto: 1,
      esfuerzo: 1,
      estado: "No iniciado",
    },
    {
      fase: "Diagnóstico",
      accion: "Levantar inventario mensual de residuos textiles por tipo y cantidad",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      impacto: 5,
      esfuerzo: 1,
      estado: "No iniciado",
    },
    {
      fase: "Clasificación y caracterización",
      accion: "Definir puntos de separación para retazos, prendas defectuosas e inventario obsoleto",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      impacto: 1,
      esfuerzo: 5,
      estado: "No iniciado",
    },
    {
      fase: "Aprovechamiento",
      accion: "Identificar opciones de reutilización, donación, reciclaje o upcycling",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      impacto: 1,
      esfuerzo: 5,
      estado: "No iniciado",
    },
    {
      fase: "Alianzas",
      accion: "Identificar aliados circulares: recicladores, fundaciones, transformadores o diseñadores",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      impacto: 1,
      esfuerzo: 5,
      estado: "No iniciado",
    },
    {
      fase: "Comercial",
      accion: "Evaluar productos o servicios derivados del aprovechamiento textil",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      impacto: 1,
      esfuerzo: 5,
      estado: "No iniciado",
    },
    {
      fase: "Seguimiento",
      accion:
        "Definir indicadores y metas de kg recuperados, % aprovechamiento y beneficio económico con medición mensual",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      impacto: 1,
      esfuerzo: 5,
      estado: "No iniciado",
    },
  ],
  faseOptions: [
    "Gestión de conocimiento",
    "Diagnóstico",
    "Clasificación y caracterización",
    "Aprovechamiento",
    "Alianzas",
    "Comercial",
    "Seguimiento",
  ],
  faseActionMap: {
    "Gestión de conocimiento":
      "Capacitar al equipo de producción, compras u operaciones en aprovechamiento de residuos textiles. Capacitación que pueden recibir de entidades como el SENA o la CAR",
    "Diagnóstico":
      "Levantar inventario mensual de residuos textiles por tipo y cantidad",
    "Clasificación y caracterización":
      "Definir puntos de separación para retazos, prendas defectuosas e inventario obsoleto",
    "Aprovechamiento":
      "Identificar opciones de reutilización, donación, reciclaje o upcycling",
    "Alianzas":
      "Identificar aliados circulares: recicladores, fundaciones, transformadores o diseñadores",
    "Comercial":
      "Evaluar productos o servicios derivados del aprovechamiento textil",
    "Seguimiento":
      "Definir indicadores y metas de kg recuperados, % aprovechamiento y beneficio económico con medición mensual",
  } as Record<string, string>,
  initialKpiRows: [
    { indicador: "% Residuos textiles aprovechados", actual: 0, meta: 0 },
    { indicador: "Kg residuos recuperados/mes", actual: 0, meta: 0 },
    { indicador: "Ingresos o ahorros por aprovechamiento", actual: 0, meta: 0 },
    { indicador: "Número de aliados circulares activos", actual: 0, meta: 0 },
    { indicador: "Acciones cerradas de la hoja de ruta", actual: 0, meta: 0 },
  ],
};

export const EVAL_ALIANZAS_COPY = {
  stepLabel: "Paso Final: Alianzas y Comercialización",
  progress: "85% completado",
  title: "Cierre de Evaluación",
  intro:
    "Ha llegado a la etapa final del autodiagnóstico. Analizaremos su capacidad de generar valor con alianzas estratégicas.",
  sectionTitle: "Alianzas y Ecosistema",
  chips: ["Recicladores de Oficio", "Fundaciones Sociales", "Gestores Autorizados", "Otras MiPymes", "Academia"],
};

export const VINCULACION_COPY = {
  stepLabel: "Paso 4 de 5",
  progress: "80% completado",
  title: "Vincula tus Aliados",
  description:
    "Identifica socios clave (centros de reciclaje, transportistas, ONGs) para cerrar el ciclo de tus residuos textiles.",
  fields: {
    name: "Nombre del Aliado",
    type: "Tipo de Aliado",
    goal: "Objetivo de la Alianza",
    contact: "Información de Contacto",
  },
  button: "Agregar Aliado a la Lista",
  listTitle: "Lista de Aliados Seleccionados",
  list: ["TransCircular Ltda.", "Hilos Verdes"],
};