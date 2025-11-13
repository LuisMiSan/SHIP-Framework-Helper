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
  }));
};

export const preloadedTemplates: ProjectTemplate[] = [
  {
    id: 'template-fitness-app',
    name: 'Plantilla: App de Fitness',
    createdAt: '2024-01-01T10:00:00.000Z',
    data: createTemplateData(
      'Los usuarios de gimnasios principiantes se sienten abrumados por la cantidad de rutinas y no saben cuál seguir para sus objetivos específicos (perder peso, ganar músculo). A menudo, terminan haciendo ejercicios ineficaces o se lesionan.',
      'Creemos que una app que genera planes de entrenamiento personalizados basados en los objetivos, nivel de experiencia y equipamiento disponible del usuario aumentará su confianza y adherencia. Mediremos el éxito por el % de usuarios que completan 3+ entrenamientos/semana.',
      '1. Cuestionario inicial (objetivo, nivel, equipamiento). 2. Generador de una rutina semanal básica con videos de los ejercicios. 3. Opción para marcar un entrenamiento como completado.',
      'Lanzamos el MVP. Muchos usuarios se registran, pero pocos completan los entrenamientos. Los comentarios dicen que las rutinas son "aburridas". Pivotamos para añadir elementos de gamificación y seguimiento del progreso más visual.'
    )
  },
  {
    id: 'template-productivity-tool',
    name: 'Plantilla: Herramienta de Productividad',
    createdAt: '2024-01-01T10:01:00.000Z',
    data: createTemplateData(
      'Los equipos remotos tienen dificultades para mantener a todos informados sobre en qué están trabajando los demás, lo que lleva a duplicación de esfuerzos y falta de visibilidad sobre el progreso de los proyectos.',
      'Creemos que un "check-in" diario asíncrono y automatizado donde cada miembro comparte sus 3 prioridades del día reducirá las reuniones innecesarias y mejorará la alineación del equipo. El éxito se medirá por una reducción del 20% en el tiempo dedicado a reuniones de estado.',
      'MVP: 1. Integración con Slack. 2. Un bot que pregunta a las 9 AM a cada miembro del canal: "¿Cuáles son tus 3 prioridades hoy?". 3. Un resumen diario de todas las respuestas publicado en el canal a las 10 AM.',
      'El equipo adopta los check-ins, pero el resumen se vuelve ruidoso e ignorado. Perseveramos, pero iteramos para agrupar las respuestas por proyecto (usando hashtags) y permitir que los usuarios vean solo las actualizaciones relevantes para ellos.'
    )
  },
  {
    id: 'template-local-community-app',
    name: 'Plantilla: App Comunidad Local',
    createdAt: '2024-01-01T10:02:00.000Z',
    data: createTemplateData(
      'La gente nueva en una ciudad, o incluso los residentes de mucho tiempo, tienen dificultades para descubrir eventos locales pequeños y auténticos (mercadillos, conciertos en bares, talleres) que no se anuncian en las grandes plataformas.',
      'Creemos que una plataforma curada por la comunidad, donde los locales pueden publicar y descubrir eventos "secretos", conectará a la gente y fomentará el comercio local. El éxito se medirá por el número de usuarios que asisten a un evento encontrado en la app cada mes.',
      'MVP: 1. Un formulario simple para que los usuarios envíen eventos (nombre, fecha, lugar, descripción). 2. Una lista cronológica de los eventos enviados, sin filtros ni mapa. 3. No hay cuentas de usuario, todo es anónimo para empezar.',
      'Los primeros usuarios envían eventos, pero la falta de un mapa hace difícil ver qué hay cerca. El feedback es claro: la ubicación es clave. Pivotamos para centrarnos en una vista de mapa como la interfaz principal antes de añadir cualquier otra función.'
    )
  },
];
