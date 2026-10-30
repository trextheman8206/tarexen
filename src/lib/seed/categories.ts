// Datos semilla. Después de la primera carga, TODO se edita desde /admin/categorias
// (no hace falta tocar este archivo para agregar o cambiar categorías).
// "{ciudad}" en las preguntas se reemplaza por el cantón del negocio.

type Pair = [es: string, en: string];
type Check = [key: string, es: string, en: string, weight: number];

export type CategorySeed = {
  slug: string;
  name: Pair;
  description: Pair;
  icon: string;
  subs: Pair[];
  checks: Check[];
  questions: Pair[];
};

// Se aplican a todas las categorías.
export const BASE_CHECKS: Check[] = [
  ["gbp_exists", "Tiene ficha de Google Business Profile", "Has a Google Business Profile", 3],
  ["nap_consistent", "Nombre, dirección y teléfono coinciden en web, Google y redes", "Name, address and phone match across web, Google and social", 3],
  ["hours", "Horario de atención publicado y actualizado", "Opening hours published and current", 2],
  ["photos", "Fotos reales y recientes del negocio", "Real, recent photos of the business", 2],
  ["reviews", "Reseñas reales recientes (últimos 6 meses)", "Recent genuine reviews (last 6 months)", 3],
  ["review_replies", "El dueño responde las reseñas", "Owner replies to reviews", 1],
  ["description", "Descripción clara: qué hace, dónde y para quién", "Clear description: what, where and for whom", 3],
  ["website", "Sitio web propio o página con la información clave", "Own website or page with key information", 2],
  ["mobile", "La web se ve bien en el celular", "Website works well on mobile", 1],
  ["social", "Redes sociales activas con datos de contacto", "Active social profiles with contact info", 1],
  ["faq", "Preguntas frecuentes respondidas públicamente", "Frequently asked questions answered publicly", 2],
  ["directories", "Presente en directorios relevantes de su sector", "Listed in relevant industry directories", 1],
];

export const CATEGORIES: CategorySeed[] = [
  {
    slug: "restaurantes",
    name: ["Restaurantes y comida", "Restaurants and food"],
    description: [
      "Restaurantes, cafeterías, panaderías, comida típica y delivery. La IA recomienda lugares con menú, horarios, fotos y reseñas claras.",
      "Restaurants, cafés, bakeries, traditional food and delivery. AI recommends places with clear menus, hours, photos and reviews.",
    ],
    icon: "🍽️",
    subs: [["Restaurantes", "Restaurants"], ["Cafeterías", "Cafeterias"], ["Panaderías", "Bakeries"], ["Pizzerías", "Pizzerias"], ["Comida rápida", "Fast food"], ["Comida típica ecuatoriana", "Traditional Ecuadorian food"], ["Marisquerías", "Seafood restaurants"], ["Cafés", "Cafés"], ["Bares", "Bars"], ["Comida a domicilio", "Food delivery"], ["Heladerías", "Ice cream shops"]],
    checks: [
      ["cuisine", "Tipo de cocina claramente indicado", "Cuisine type clearly stated", 3],
      ["menu", "Menú disponible en línea (texto, no solo foto)", "Menu available online (text, not only an image)", 3],
      ["dish_desc", "Platos descritos (ingredientes, especialidades)", "Dishes described (ingredients, specialties)", 2],
      ["price_range", "Rango de precios indicado", "Price range stated", 2],
      ["delivery", "Información de delivery (zonas, apps, WhatsApp)", "Delivery information (areas, apps, WhatsApp)", 2],
      ["reservations", "Cómo reservar", "How to book a table", 1],
      ["dietary", "Opciones vegetarianas/sin gluten (solo si son verificables)", "Vegetarian/gluten-free options (only if verified)", 1],
    ],
    questions: [
      ["¿Cuál es el mejor restaurante en {ciudad}?", "What is the best restaurant in {ciudad}, Ecuador?"],
      ["¿Dónde comer comida típica ecuatoriana en {ciudad}?", "Where can I eat traditional Ecuadorian food in {ciudad}?"],
      ["¿Qué restaurante en {ciudad} tiene delivery?", "Which restaurant in {ciudad} delivers?"],
      ["Mejor panadería cerca de {ciudad}", "Best bakery near {ciudad}"],
    ],
  },
  {
    slug: "tiendas-de-barrio",
    name: ["Bodegas y tiendas de barrio", "Neighborhood stores"],
    description: [
      "Tiendas de barrio, minimarkets, víveres y licorerías. Lo clave: aparecer en Maps con horario, productos y delivery por WhatsApp.",
      "Corner stores, minimarkets, groceries and beverage shops. Key: showing up on Maps with hours, products and WhatsApp delivery.",
    ],
    icon: "🛒",
    subs: [["Tiendas de barrio", "Corner stores"], ["Bodegas", "Bodegas"], ["Minimarkets", "Minimarkets"], ["Víveres", "Grocery stores"], ["Tiendas de conveniencia", "Convenience stores"], ["Supermercados", "Supermarkets"], ["Alimentos especiales", "Specialty food shops"], ["Licorerías y bebidas", "Beverage stores"]],
    checks: [
      ["store_type", "Tipo de tienda claro (víveres, minimarket, licorería…)", "Store type clear (grocery, minimarket, beverages…)", 3],
      ["product_cats", "Categorías de productos publicadas", "Product categories published", 3],
      ["delivery", "Delivery y zonas de entrega publicadas", "Delivery and delivery areas published", 3],
      ["whatsapp", "Pedidos por WhatsApp visibles", "WhatsApp ordering visible", 2],
      ["payment", "Formas de pago (efectivo, transferencia, tarjeta)", "Payment methods (cash, transfer, card)", 1],
      ["no_stock_claims", "No se afirma stock sin fuente de inventario confiable", "No stock claims without a reliable inventory source", 1],
    ],
    questions: [
      ["¿Dónde puedo comprar víveres en {ciudad}?", "Where can I buy groceries in {ciudad}?"],
      ["Tienda abierta cerca de {ciudad} con delivery", "Store open near {ciudad} with delivery"],
      ["Minimarket en {ciudad}", "Minimarket in {ciudad}"],
    ],
  },
  {
    slug: "comercio",
    name: ["Comercio y tiendas", "Retail and shopping"],
    description: [
      "Ropa, calzado, electrónica, ferreterías, farmacias y muebles. La IA necesita saber qué marcas y productos vendes y dónde.",
      "Clothing, shoes, electronics, hardware, pharmacies and furniture. AI needs to know which brands and products you sell, and where.",
    ],
    icon: "🛍️",
    subs: [["Ropa", "Clothing stores"], ["Calzado", "Shoe stores"], ["Electrónica", "Electronics stores"], ["Computadoras", "Computer stores"], ["Muebles", "Furniture stores"], ["Ferreterías", "Hardware stores"], ["Farmacias", "Pharmacies"], ["Belleza y cosméticos", "Beauty shops"], ["Mejoras para el hogar", "Home improvement"]],
    checks: [
      ["products", "Productos y marcas principales publicados", "Main products and brands published", 3],
      ["catalog", "Catálogo o lista de productos en línea", "Online catalog or product list", 2],
      ["warranty", "Garantía, cambios y devoluciones explicadas", "Warranty, exchanges and returns explained", 1],
      ["delivery", "Envíos o retiro en tienda", "Shipping or in-store pickup", 2],
      ["payment", "Formas de pago y crédito", "Payment and credit options", 1],
    ],
    questions: [
      ["¿Dónde comprar electrónica en {ciudad}?", "Where can I buy electronics in {ciudad}?"],
      ["Mejor ferretería en {ciudad}", "Best hardware store in {ciudad}"],
      ["Farmacia abierta en {ciudad}", "Pharmacy open in {ciudad}"],
    ],
  },
  {
    slug: "turismo",
    name: ["Turismo y alojamiento", "Tourism and accommodation"],
    description: [
      "Hoteles, hostales, tours y agencias. Los turistas extranjeros ya planifican viajes con ChatGPT: idiomas, servicios y reservas deben estar claros.",
      "Hotels, hostels, tours and agencies. International travelers already plan trips with ChatGPT: languages, amenities and booking must be clear.",
    ],
    icon: "🏨",
    subs: [["Hoteles", "Hotels"], ["Hostales", "Hostels"], ["Resorts", "Resorts"], ["Administradores de Airbnb", "Airbnb property managers"], ["Operadores de turismo", "Tour operators"], ["Agencias de viajes", "Travel agencies"], ["Atractivos turísticos", "Tourist attractions"], ["Restaurantes para turistas", "Restaurants serving tourists"], ["Turismo de aventura", "Adventure tourism"]],
    checks: [
      ["acc_type", "Tipo de alojamiento o tour claro", "Accommodation or tour type clear", 3],
      ["amenities", "Servicios/amenidades listados (wifi, parqueo, desayuno…)", "Amenities listed (wifi, parking, breakfast…)", 3],
      ["languages", "Idiomas de atención indicados", "Languages spoken stated", 2],
      ["booking", "Cómo reservar (directo, Booking, Airbnb, WhatsApp)", "How to book (direct, Booking, Airbnb, WhatsApp)", 3],
      ["english_content", "Contenido en inglés para visitantes", "English content for visitors", 2],
      ["ota_consistency", "Datos consistentes en Booking/TripAdvisor/Airbnb", "Consistent data on Booking/TripAdvisor/Airbnb", 2],
      ["licenses", "Registro turístico mencionado (si es verificable)", "Tourism registration mentioned (if verifiable)", 1],
    ],
    questions: [
      ["¿Cuál es el mejor hotel en {ciudad} para turistas?", "What is the best hotel in {ciudad} for tourists?"],
      ["Hostal económico en {ciudad}", "Budget hostel in {ciudad}, Ecuador"],
      ["¿Qué operador de turismo recomiendas en {ciudad}?", "Which tour operator do you recommend in {ciudad}?"],
      ["Dónde hospedarse en {ciudad} con familia", "Where to stay in {ciudad} with family"],
    ],
  },
  {
    slug: "automotriz",
    name: ["Automotriz", "Automotive"],
    description: [
      "Mecánicas, lubricadoras, llantas, repuestos y lavadoras. La confianza es todo: servicios, marcas que atiendes y reseñas reales.",
      "Mechanics, oil change, tires, parts and car washes. Trust is everything: services, brands you service and real reviews.",
    ],
    icon: "🔧",
    subs: [["Mecánicas", "Mechanics"], ["Concesionarios", "Car dealerships"], ["Lavadoras de autos", "Car washes"], ["Llanteras", "Tire shops"], ["Repuestos", "Auto parts"], ["Motos", "Motorcycle shops"], ["Servicios automotrices", "Automotive services"]],
    checks: [
      ["services", "Servicios listados (frenos, motor, eléctrico, ABC…)", "Services listed (brakes, engine, electrical…)", 3],
      ["vehicle_types", "Tipos y marcas de vehículos atendidos", "Vehicle types and brands serviced", 2],
      ["emergency", "Atención de emergencia / grúa indicada", "Emergency service / towing stated", 2],
      ["pricing_info", "Cotización o precios de referencia", "Quote process or reference prices", 1],
      ["warranty", "Garantía del trabajo", "Workmanship warranty", 1],
    ],
    questions: [
      ["Mecánico confiable en {ciudad}", "Reliable mechanic in {ciudad}"],
      ["¿Dónde cambiar llantas en {ciudad}?", "Where to change tires in {ciudad}?"],
      ["Taller mecánico abierto el domingo en {ciudad}", "Auto repair shop open on Sunday in {ciudad}"],
    ],
  },
  {
    slug: "servicios-personales",
    name: ["Servicios personales", "Personal services"],
    description: [
      "Peluquerías, barberías, spas, gimnasios, dentistas y veterinarias. Citas fáciles, servicios claros y reseñas recientes.",
      "Hair salons, barbers, spas, gyms, dentists and vets. Easy appointments, clear services and recent reviews.",
    ],
    icon: "💈",
    subs: [["Peluquerías", "Hair salons"], ["Barberías", "Barbershops"], ["Spas", "Spas"], ["Gimnasios", "Gyms"], ["Entrenadores personales", "Personal trainers"], ["Dentistas", "Dentists"], ["Veterinarias", "Veterinarians"], ["Clínicas de belleza", "Beauty clinics"]],
    checks: [
      ["services", "Servicios y precios de referencia", "Services and reference prices", 3],
      ["appointments", "Cómo agendar cita (WhatsApp, web, llamada)", "How to book an appointment", 3],
      ["qualifications", "Títulos/certificaciones (solo si son verificables)", "Qualifications (only if publicly verifiable)", 2],
      ["team", "Equipo o profesional presentado", "Team or professional introduced", 1],
    ],
    questions: [
      ["Mejor barbería en {ciudad}", "Best barbershop in {ciudad}"],
      ["Veterinaria de confianza en {ciudad}", "Trusted veterinarian in {ciudad}"],
      ["Dentista recomendado en {ciudad}", "Recommended dentist in {ciudad}"],
    ],
  },
  {
    slug: "servicios-profesionales",
    name: ["Servicios profesionales", "Professional services"],
    description: [
      "Contadores, abogados, consultores, arquitectos y agencias. La IA recomienda a quien explica con claridad su especialidad y experiencia.",
      "Accountants, lawyers, consultants, architects and agencies. AI recommends those who clearly explain their specialty and experience.",
    ],
    icon: "💼",
    subs: [["Contadores", "Accountants"], ["Abogados", "Lawyers"], ["Consultores", "Consultants"], ["Arquitectos", "Architects"], ["Ingenieros", "Engineers"], ["Agencias de marketing", "Marketing agencies"], ["Desarrollo web", "Web development companies"]],
    checks: [
      ["specialty", "Especialidades y servicios explicados", "Specialties and services explained", 3],
      ["credentials", "Registro profesional (solo si es verificable)", "Professional registration (only if verifiable)", 2],
      ["cases", "Casos o ejemplos de trabajo (con permiso)", "Case studies or work samples (with permission)", 2],
      ["appointments", "Cómo agendar una consulta", "How to book a consultation", 2],
      ["linkedin", "Perfil profesional (LinkedIn u otro) coherente", "Consistent professional profile (LinkedIn etc.)", 1],
    ],
    questions: [
      ["Contador para emprendedores RIMPE en {ciudad}", "Accountant for small businesses in {ciudad}"],
      ["Abogado laboral en {ciudad}", "Employment lawyer in {ciudad}"],
      ["Agencia de marketing en {ciudad}", "Marketing agency in {ciudad}"],
    ],
  },
  {
    slug: "construccion-hogar",
    name: ["Construcción y hogar", "Construction and home services"],
    description: [
      "Plomeros, electricistas, pintores, constructoras y limpieza. Zona de cobertura, servicios y tiempos de respuesta claros.",
      "Plumbers, electricians, painters, builders and cleaning. Clear service area, services and response times.",
    ],
    icon: "🏗️",
    subs: [["Plomeros", "Plumbers"], ["Electricistas", "Electricians"], ["Pintores", "Painters"], ["Constructoras", "Construction companies"], ["Limpieza", "Cleaning services"], ["Aire acondicionado", "Air conditioning"], ["Jardinería", "Landscaping"]],
    checks: [
      ["services", "Servicios listados con detalle", "Services listed in detail", 3],
      ["service_area", "Zona de cobertura (cantones/parroquias atendidos)", "Service area (cantons/parishes served)", 3],
      ["emergency", "Atención de emergencias y horario", "Emergency service and hours", 2],
      ["portfolio", "Fotos de trabajos realizados", "Photos of completed work", 2],
      ["quotes", "Cómo pedir cotización", "How to request a quote", 1],
    ],
    questions: [
      ["Plomero de confianza en {ciudad}", "Trusted plumber in {ciudad}"],
      ["Electricista a domicilio en {ciudad}", "Home electrician in {ciudad}"],
      ["Empresa de construcción en {ciudad}", "Construction company in {ciudad}"],
    ],
  },
  {
    slug: "salud",
    name: ["Salud y bienestar", "Healthcare and wellness"],
    description: [
      "Clínicas, centros médicos, laboratorios, ópticas y fisioterapia. Información precisa y verificable: especialidades, horarios y seguros.",
      "Clinics, medical centers, labs, opticians and physiotherapy. Accurate, verifiable information: specialties, hours and insurance.",
    ],
    icon: "🩺",
    subs: [["Clínicas", "Clinics"], ["Centros médicos", "Medical centers"], ["Laboratorios", "Laboratories"], ["Ópticas", "Opticians"], ["Fisioterapia", "Physiotherapy"], ["Centros de bienestar", "Wellness centers"]],
    checks: [
      ["specialties", "Especialidades y exámenes listados", "Specialties and tests listed", 3],
      ["doctors", "Profesionales con registro (solo si es verificable)", "Licensed professionals (only if verifiable)", 2],
      ["insurance", "Seguros/convenios aceptados", "Insurance/agreements accepted", 2],
      ["appointments", "Cómo agendar cita y tiempos de espera", "How to book and waiting times", 2],
      ["no_medical_claims", "Sin promesas médicas no sustentadas", "No unsupported medical claims", 2],
    ],
    questions: [
      ["Laboratorio clínico en {ciudad}", "Clinical laboratory in {ciudad}"],
      ["Mejor óptica en {ciudad}", "Best optician in {ciudad}"],
      ["Fisioterapeuta recomendado en {ciudad}", "Recommended physiotherapist in {ciudad}"],
    ],
  },
  {
    slug: "educacion",
    name: ["Educación", "Education"],
    description: [
      "Escuelas, institutos, idiomas, tutores y capacitación. Programas, modalidad, horarios y resultados verificables.",
      "Schools, institutes, language schools, tutors and training. Programs, format, schedules and verifiable results.",
    ],
    icon: "🎓",
    subs: [["Escuelas y colegios", "Schools"], ["Universidades", "Universities"], ["Escuelas de idiomas", "Language schools"], ["Tutores", "Tutors"], ["Centros de capacitación", "Training centers"], ["Educación en línea", "Online education"]],
    checks: [
      ["programs", "Programas/cursos con descripción", "Programs/courses described", 3],
      ["modality", "Modalidad (presencial, en línea) y horarios", "Format (in person, online) and schedules", 2],
      ["enrollment", "Proceso de inscripción y costos de referencia", "Enrollment process and reference costs", 2],
      ["accreditation", "Acreditación (solo si es verificable)", "Accreditation (only if verifiable)", 2],
    ],
    questions: [
      ["Escuela de inglés en {ciudad}", "English school in {ciudad}"],
      ["Clases de español para extranjeros en {ciudad}", "Spanish classes for foreigners in {ciudad}"],
      ["Tutor de matemáticas en {ciudad}", "Math tutor in {ciudad}"],
    ],
  },
  {
    slug: "entretenimiento",
    name: ["Entretenimiento y recreación", "Entertainment and recreation"],
    description: [
      "Cines, salones de eventos, discotecas, canchas y centros culturales. Agenda, capacidad, precios y cómo reservar.",
      "Cinemas, event venues, nightclubs, sports facilities and cultural centers. Schedule, capacity, prices and booking.",
    ],
    icon: "🎉",
    subs: [["Cines", "Cinemas"], ["Salones de eventos", "Event venues"], ["Discotecas", "Nightclubs"], ["Centros de juegos", "Gaming centers"], ["Instalaciones deportivas", "Sports facilities"], ["Atractivos culturales", "Cultural attractions"]],
    checks: [
      ["schedule", "Agenda o programación publicada", "Schedule or programming published", 2],
      ["capacity", "Capacidad y tipos de evento", "Capacity and event types", 2],
      ["prices", "Precios o paquetes de referencia", "Reference prices or packages", 2],
      ["booking", "Cómo reservar", "How to book", 2],
      ["accessibility", "Accesibilidad y parqueo", "Accessibility and parking", 1],
    ],
    questions: [
      ["Salón de eventos en {ciudad}", "Event venue in {ciudad}"],
      ["¿Qué hacer el fin de semana en {ciudad}?", "What to do on the weekend in {ciudad}?"],
      ["Cancha sintética para alquilar en {ciudad}", "Soccer field to rent in {ciudad}"],
    ],
  },
  {
    slug: "otros",
    name: ["Otros negocios", "Other businesses"],
    description: [
      "¿Tu negocio no encaja en ninguna categoría? Cuéntanos tu industria y adaptamos el análisis.",
      "Your business doesn't fit a category? Tell us your industry and we adapt the audit.",
    ],
    icon: "✨",
    subs: [],
    checks: [["offer", "Oferta principal explicada con claridad", "Main offer clearly explained", 3]],
    questions: [["¿Dónde encontrar [tu servicio] en {ciudad}?", "Where can I find [your service] in {ciudad}?"]],
  },
];
