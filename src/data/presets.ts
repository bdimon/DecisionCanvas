import { PresetExample } from '../types';
import { Language } from '../i18n/translations';

export const PRESET_EXAMPLES_RU: PresetExample[] = [
  {
    id: 'career-job',
    name: 'Карьера: Корпорация vs Стартап',
    category: 'Работа и карьера',
    option1: 'Остаться в стабильной крупной корпорации',
    option2: 'Перейти ведущим специалистом в быстрорастущий стартап',
    context: 'Опыт 5 лет, есть семья и небольшие финансовые обязательства, хочется профессионального роста, но важна предсказуемость дохода.'
  },
  {
    id: 'housing-mortgage-rent',
    name: 'Жилье: Ипотека vs Аренда + Инвестиции',
    category: 'Финансы и недвижимость',
    option1: 'Купить квартиру в новостройке в ипотеку на 20 лет',
    option2: 'Снимать комфортное жилье и свободные деньги инвестировать',
    context: 'Город-миллионник, есть первоначальный взнос 25%, горизонт планирования от 5 до 10 лет.'
  },
  {
    id: 'transport-auto',
    name: 'Транспорт: Личный авто vs Каршеринг/Такси',
    category: 'Личные финансы',
    option1: 'Купить новый надежный автомобиль (с расходами на ТО, страховку, бензин, парковку)',
    option2: 'Пользоваться каршерингом, общественным транспортом и такси',
    context: 'Город с развитой инфраструктурой, поездки в основном по городу 3-4 раза в неделю и редкие выезды за город.'
  },
  {
    id: 'tech-stack',
    name: 'IT: Монолит vs Микросервисы',
    category: 'Архитектура ПО',
    option1: 'Разрабатывать модульный монолит',
    option2: 'Сразу строить микросервисную архитектуру с оркестрацией',
    context: 'Команда из 6 разработчиков, запускаем новый SaaS-продукт с неопределенным начальным трафиком.'
  },
  {
    id: 'education-mba',
    name: 'Образование: Очное MBA vs Онлайн-курсы и практика',
    category: 'Саморазвитие',
    option1: 'Поступить на очную 2-годичную программу MBA с нетворкингом',
    option2: 'Остаться на работе, изучать целевые онлайн-курсы и практиковаться на реальных проектах',
    context: 'Менеджер среднего звена, бюджет на обучение требует частичных сбережений.'
  }
];

export const PRESET_EXAMPLES_EN: PresetExample[] = [
  {
    id: 'career-job',
    name: 'Career: Big Tech Enterprise vs High-Growth Startup',
    category: 'Career & Work',
    option1: 'Stay at stable enterprise corporation',
    option2: 'Join high-growth venture-backed startup as a lead',
    context: '5 years of experience, family commitments, seeking accelerated professional growth while balancing income stability.'
  },
  {
    id: 'housing-mortgage-rent',
    name: 'Housing: 25-Year Mortgage vs Rent & Index Investing',
    category: 'Real Estate & Wealth',
    option1: 'Buy modern apartment with 25-year mortgage',
    option2: 'Rent quality apartment and invest surplus cash into diversified index funds',
    context: 'Major metropolitan area, 25% down payment ready, planning horizon of 5 to 10 years.'
  },
  {
    id: 'transport-auto',
    name: 'Mobility: Own New Vehicle vs Ride-Hailing & Transit',
    category: 'Personal Finance',
    option1: 'Purchase reliable vehicle with full maintenance, insurance and parking costs',
    option2: 'Rely on car-sharing, ride-hailing services, and modern public transit',
    context: 'Urban city with good infrastructure, commuting 3-4 days a week with occasional weekend trips.'
  },
  {
    id: 'tech-stack',
    name: 'Engineering: Modular Monolith vs Microservices',
    category: 'Software Architecture',
    option1: 'Build clean, domain-driven modular monolith',
    option2: 'Adopt distributed microservices architecture with Kubernetes orchestration',
    context: 'Core engineering team of 6, launching a new B2B SaaS platform with uncertain day-one traffic.'
  },
  {
    id: 'education-mba',
    name: 'Growth: Full-time MBA vs Self-Directed Applied Courses',
    category: 'Executive Education',
    option1: 'Enroll in top full-time 2-year MBA with global peer networking',
    option2: 'Keep full-time position, take targeted masterclasses, and execute live production initiatives',
    context: 'Mid-level team lead, educational tuition would require tapping into personal reserves.'
  }
];

export function getPresets(language: Language = 'ru'): PresetExample[] {
  return language === 'en' ? PRESET_EXAMPLES_EN : PRESET_EXAMPLES_RU;
}

export const PRESET_EXAMPLES = PRESET_EXAMPLES_RU;
