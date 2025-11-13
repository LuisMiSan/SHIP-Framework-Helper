import { StepData } from '../types';

export const initialStepsData: StepData[] = [
  {
    id: 'solve',
    title: 'Paso 1: Definir el Problema',
    description: [
      'Describe claramente el problema que quieres resolver. ¿Para quién es? ¿Por qué es importante? Intenta llegar a la ',
      { word: 'causa raíz', tip: 'El problema fundamental que, si se resolviera, eliminaría muchos problemas superficiales.' },
      '.'
    ],
    placeholder: 'Ej: Los cocineros aficionados tienen dificultades para encontrar recetas saludables y fáciles que se ajusten a sus restricciones dietéticas...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
  },
  {
    id: 'hypothesize',
    title: 'Paso 2: Formular una Hipótesis',
    description: [
      'Propón una solución. ¿Cuál es tu ',
      { word: 'hipótesis', tip: 'Una suposición comprobable sobre cómo tu solución resolverá el problema para tus usuarios.' },
      ' sobre cómo resolver el problema y cómo medirás el éxito?'
    ],
    placeholder: 'Creemos que una app móvil con filtros de recetas por dieta, alergias y tiempo de preparación ayudará a los cocineros a encontrar comidas adecuadas rápidamente. El éxito se medirá por el número de recetas guardadas...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
  },
  {
    id: 'implement',
    title: 'Paso 3: Planificar la Implementación (MVP)',
    description: [
      'Define el ',
      { word: 'Producto Mínimo Viable (MVP)', tip: 'La versión más simple de un producto que se puede lanzar para probar la hipótesis principal con el menor esfuerzo.' },
      '. ¿Cuáles son las características esenciales para probar tu hipótesis?'
    ],
    placeholder: 'Ej: 1. Buscador de recetas con filtros. 2. Página de detalles de la receta. 3. Opción para guardar recetas favoritas...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
  },
  {
    id: 'persevere',
    title: 'Paso 4: Perseverar o Pivotar',
    description: [
      'Imagina que has lanzado tu MVP. Describe los resultados (reales o imaginarios) y reflexiona sobre los siguientes pasos. ¿Debes ',
      { word: 'Perseverar', tip: 'Continuar con la misma estrategia porque los resultados son prometedores.' },
      ' o ',
      { word: 'Pivotar', tip: 'Hacer un cambio fundamental en tu estrategia basado en lo que has aprendido.' },
      '?'
    ],
    placeholder: 'Ej: Después del lanzamiento, notamos que muchos usuarios guardan recetas pero pocos las cocinan. Los comentarios indican que los ingredientes son difíciles de encontrar...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
  },
];
