
import { ProjectTemplate, StepData } from '../types';
import { initialStepsData } from './initialData';

const createTemplateData = (solve: string, hypothesize: string, implement: string, persevere: string): StepData[] => {
  const templateMap = { solve, hypothesize, implement, persevere };
  return initialStepsData.map(step => ({
    ...step,
    userInput: templateMap[step.id] || '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
    groundingChunks: [],
  }));
};

export const preloadedTemplates: ProjectTemplate[] = [
  {
    id: 'template-fitness-app',
    name: 'Fitness: Entrenador Personal AI',
    createdAt: '2024-01-01T10:00:00.000Z',
    data: createTemplateData(
      'Los usuarios de gimnasios principiantes se sienten abrumados por la cantidad de rutinas y no saben cuál seguir para sus objetivos específicos. A menudo, terminan haciendo ejercicios ineficaces o se lesionan por mala técnica.',
      'Creemos que una app que genera planes de entrenamiento personalizados basados en IA y corrige la postura mediante la cámara aumentará la confianza. Mediremos el éxito por el % de usuarios que completan 3+ entrenamientos/semana durante el primer mes.',
      '1. Cuestionario inicial (objetivo, nivel, lesiones). 2. Generador de rutina semanal. 3. Análisis de video simple para contar repeticiones. Lo que NO haremos: Planes de dieta complejos ni integración con wearables en el MVP.',
      'Lanzamos el MVP. Muchos usuarios se registran, pero pocos usan la función de cámara en el gimnasio por vergüenza. Pivotamos para centrarnos en rutinas de audio guiadas y videos demostrativos pregrabados en lugar de corrección en tiempo real.'
    )
  },
  {
    id: 'template-saas-b2b',
    name: 'SaaS B2B: Automatización de Feedback',
    createdAt: '2024-02-15T10:00:00.000Z',
    data: createTemplateData(
      'Los gerentes de producto en empresas medianas reciben feedback de clientes por Slack, Email, Jira y llamadas, perdiendo información valiosa y duplicando peticiones de funcionalidades.',
      'Creemos que una herramienta que centralice automáticamente el feedback desde múltiples canales usando integraciones simples ahorrará 10 horas semanales al equipo de producto. El éxito será que el 40% de los usuarios activos conecten al menos 2 fuentes de datos.',
      'MVP: 1. Integración con Slack y Email (forwarding). 2. Un tablero estilo Kanban para agrupar feedback. 3. Etiquetado manual. OMITIR: Análisis de sentimiento con IA o respuestas automáticas.',
      'Los usuarios conectan Slack, pero no usan el tablero porque "es otra herramienta más". Perseveramos en el problema, pero pivotamos la solución: en lugar de un nuevo tablero, enviamos resúmenes semanales digeridos directamente a su Slack.'
    )
  },
  {
    id: 'template-ecommerce-sustainable',
    name: 'E-commerce: Moda Circular',
    createdAt: '2024-03-10T09:30:00.000Z',
    data: createTemplateData(
      'Los consumidores conscientes del medio ambiente quieren comprar ropa de segunda mano de calidad, pero desconfían de las plataformas existentes por la falta de verificación de estado y autenticidad.',
      'Creemos que un marketplace de nicho que ofrece "garantía de calidad verificada" para prendas premium de segunda mano aumentará el ticket medio de compra. Mediremos el éxito logrando un retorno de prendas inferior al 5%.',
      'MVP: 1. Landing page para captar vendedores de ropa de marca. 2. Proceso manual de recepción y fotos profesionales hechas por nosotros. 3. Tienda Shopify básica. OMITIR: App móvil o sistema de pujas.',
      'La demanda es alta, pero la logística de recibir y fotografiar cada prenda es demasiado costosa y lenta (cuello de botella). Pivotamos a un modelo P2P donde el vendedor hace las fotos, pero nosotros retenemos el pago hasta que el comprador confirma la calidad.'
    )
  },
  {
    id: 'template-edtech-language',
    name: 'EdTech: Idiomas para Profesionales',
    createdAt: '2024-04-05T14:20:00.000Z',
    data: createTemplateData(
      'Los profesionales del sector tech necesitan mejorar su inglés técnico rápidamente para optar a puestos remotos, pero las apps actuales (Duolingo) son demasiado genéricas y lentas.',
      'Creemos que una plataforma de micro-learning centrada exclusivamente en vocabulario técnico y simulaciones de "Daily Standups" atraerá a desarrolladores. Métrica: 20% de conversión a pago tras la prueba gratuita de 7 días.',
      'MVP: 1. 50 lecciones de texto/audio sobre términos de desarrollo de software. 2. Un simulador de chat tipo bot para practicar respuestas de entrevistas. 3. Sin gamificación compleja ni rankings.',
      'Los usuarios aman el contenido específico, pero piden práctica oral real. Perseveramos y añadimos una funcionalidad para reservar sesiones de 15 minutos con tutores especializados en tech.'
    )
  },
  {
    id: 'template-service-home',
    name: 'Servicios: Reparaciones Urgentes',
    createdAt: '2024-05-20T11:15:00.000Z',
    data: createTemplateData(
      'Encontrar un fontanero o electricista de confianza para una urgencia en fin de semana es casi imposible y los precios son opacos y abusivos.',
      'Creemos que una plataforma "tipo Uber" con precios pre-acordados y disponibilidad en tiempo real para urgencias domésticas captará mercado rápidamente. Éxito: Tiempo medio de llegada < 2 horas en el 90% de los casos.',
      'MVP: 1. Formulario web simple "Necesito ayuda ahora". 2. Red de 5 profesionales de confianza contactados manualmente por WhatsApp. 3. Pago a través de la web para asegurar el compromiso. OMITIR: Mapa en tiempo real del técnico.',
      'Los clientes están encantados, pero nos cuesta retener a los profesionales porque prefieren cobrar en efectivo sin comisiones. Pivotamos a un modelo de suscripción anual para el hogar que incluye 2 urgencias gratis, garantizando volumen a los técnicos.'
    )
  },
  {
    id: 'template-fintech-micro',
    name: 'FinTech: Ahorro Gamificado Gen Z',
    createdAt: '2024-06-12T16:45:00.000Z',
    data: createTemplateData(
      'A la Gen Z le cuesta ahorrar dinero debido a la gratificación instantánea y la falta de educación financiera atractiva.',
      'Creemos que una app que redondea las compras y convierte el ahorro en un juego (tamagotchi que crece con tus ahorros) aumentará la retención. Métrica: Ahorro promedio mensual > $50 por usuario.',
      'MVP: 1. Conexión bancaria básica (lectura). 2. Lógica de redondeo. 3. Una mascota virtual simple que cambia de estado según el saldo. OMITIR: Consejos de inversión o criptomonedas.',
      'La conexión bancaria falla a menudo y frustra a los usuarios. Sin embargo, la mascota gusta mucho. Simplificamos el MVP: en lugar de conexión automática, el usuario registra gastos manualmente y "alimenta" a la mascota.'
    )
  },
  {
    id: 'template-productivity-tool',
    name: 'Productividad: Check-ins Remotos',
    createdAt: '2024-01-01T10:01:00.000Z',
    data: createTemplateData(
      'Los equipos remotos tienen dificultades para mantener a todos informados sobre en qué están trabajando los demás, lo que lleva a duplicación de esfuerzos y falta de visibilidad.',
      'Creemos que un "check-in" diario asíncrono y automatizado donde cada miembro comparte sus 3 prioridades reducirá reuniones innecesarias. El éxito se medirá por una reducción del 20% en tiempo de reuniones.',
      'MVP: 1. Integración con Slack. 2. Bot que pregunta a las 9 AM: "¿Cuáles son tus 3 prioridades?". 3. Resumen diario publicado en el canal. OMITIR: Panel de control web o estadísticas complejas.',
      'El equipo adopta los check-ins, pero el resumen se vuelve ruidoso e ignorado. Perseveramos, pero iteramos para agrupar las respuestas por proyecto (hashtags) y permitir filtros.'
    )
  },
  {
    id: 'template-local-community-app',
    name: 'Comunidad: Eventos Secretos',
    createdAt: '2024-01-01T10:02:00.000Z',
    data: createTemplateData(
      'La gente nueva en una ciudad tiene dificultades para descubrir eventos locales pequeños y auténticos que no se anuncian en grandes plataformas.',
      'Creemos que una plataforma curada por la comunidad para eventos "secretos" fomentará el comercio local. Éxito: Número de usuarios que asisten a un evento/mes.',
      'MVP: 1. Formulario simple para enviar eventos. 2. Lista cronológica sin filtros. 3. Sin cuentas de usuario (anónimo).',
      'Falta de mapa hace difícil ver qué hay cerca. Pivotamos para centrarnos en una vista de mapa como interfaz principal.'
    )
  },
];
