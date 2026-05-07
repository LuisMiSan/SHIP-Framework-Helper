import { StepData } from '../types';

export const initialStepsData: StepData[] = [
  {
    id: 'solve',
    title: '1. SOLVE (Resolver)',
    description: [
      'Define el problema real que estás resolviendo. ',
      { word: '¿Quién tiene este dolor?', tip: 'Describe a tu cliente ideal.' },
      ' Sé lo más específico posible.'
    ],
    helpText: 'Describe el problema en lenguaje claro. Evita hablar de la solución todavía.',
    placeholder: 'Ej: Los dueños de mascotas en ciudades grandes no tienen tiempo para pasear a sus perros durante el día...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: []
  },
  {
    id: 'hypothesize',
    title: '2. HYPOTHESIZE (Hipotetizar)',
    description: [
      'Crea una hipótesis de negocio. ',
      { word: 'Si hacemos X para Y, entonces Z.', tip: 'X = Solución, Y = Público, Z = Resultado esperado.' }
    ],
    helpText: 'Estructura tu idea como una suposición comprobable.',
    placeholder: 'Ej: Creemos que al ofrecer un servicio de paseadores certificados bajo demanda...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: []
  },
  {
    id: 'implement',
    title: '3. IMPLEMENT (Implementar)',
    description: [
      'Define tu MVP (Producto Mínimo Viable). ',
      { word: '¿Qué es lo mínimo?', tip: 'La versión más simple para probar tu hipótesis.' }
    ],
    helpText: 'No planees el producto final. Planea la prueba.',
    placeholder: 'Ej: Una landing page con un formulario de registro y un chat de WhatsApp manual...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: []
  },
  {
    id: 'persevere',
    title: '4. PERSEVERE (Perseverar)',
    description: [
      'Analiza los resultados de tus pruebas. ',
      { word: '¿Validado o Invalidado?', tip: 'Basado en datos, no en sentimientos.' }
    ],
    helpText: 'Registra lo que aprendiste y decide si continúas o cambias de dirección.',
    placeholder: 'Ej: Conseguimos 50 registros pero nadie pagó el servicio de prueba...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: []
  }
];
