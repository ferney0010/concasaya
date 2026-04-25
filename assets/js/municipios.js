/**
 * Fuente única de cobertura para menús de navegación.
 * Para agregar un país: añade un objeto en PAISES con { slug, nombre, icono? }
 * y crea la página en /pages/nombre-archivo.html.
 * Para agregar un municipio: añade un objeto en MUNICIPIOS con { slug, nombre }.
 */
window.PAISES = [
  {
    slug: "colombianos-en-el-exterior",
    nombre: "Colombianos en el exterior",
    icono: "fas fa-globe-americas"
  },
  {
    slug: "colombianos-estados-unidos",
    nombre: "Estados Unidos",
    icono: "fas fa-flag-usa"
  },
  {
    slug: "colombianos-espana",
    nombre: "España",
    icono: "fas fa-flag"
  },
  {
    slug: "colombianos-canada",
    nombre: "Canadá",
    icono: "fab fa-canadian-maple-leaf"
  },
  {
    slug: "colombianos-mexico",
    nombre: "México",
    icono: "fas fa-flag"
  }
];

window.MUNICIPIOS = [
  { slug: "chia", nombre: "Chía" },
  { slug: "cajica", nombre: "Cajicá" },
  { slug: "cota", nombre: "Cota" },
  { slug: "mosquera", nombre: "Mosquera" },
  { slug: "zipaquira", nombre: "Zipaquirá" },
  { slug: "sopo", nombre: "Sopó" },
  { slug: "suba", nombre: "Suba" },
  { slug: "funza", nombre: "Funza" },
  { slug: "villadeleyva", nombre: "Villa de Leyva" },
  { slug: "la-vega", nombre: "La Vega" },
  { slug: "madrid", nombre: "Madrid" },
  { slug: "tocancipa", nombre: "Tocancipá" },
  { slug: "tunja", nombre: "Tunja" },
  { slug: "duitama", nombre: "Duitama" },
  { slug: "paipa", nombre: "Paipa" },
  { slug: "samaca", nombre: "Samacá" },
  { slug: "boyaca", nombre: "Boyacá" },
  { slug: "barbosa", nombre: "Barbosa" },
  { slug: "choconta", nombre: "Chocontá" },
  { slug: "san-francisco", nombre: "San Francisco" },
  { slug: "supata", nombre: "Supatá" },
  { slug: "pacho", nombre: "Pacho" },
  { slug: "puente-nacional", nombre: "Puente Nacional" },
  { slug: "la-mesa", nombre: "La Mesa" },
  { slug: "mesitas-del-colegio", nombre: "Mesitas del Colegio" },
  { slug: "facatativa", nombre: "Facatativá" },
  { slug: "sogamoso", nombre: "Sogamoso" },
  { slug: "firavitoba", nombre: "Firavitoba" },
  { slug: "valle-de-tenza", nombre: "Valle de Tenza" },
  { slug: "velez", nombre: "Vélez" },
  { slug: "subachoque", nombre: "Subachoque" },
  { slug: "soacha", nombre: "Soacha" },
  { slug: "guasca", nombre: "Guasca" },
  { slug: "sesquile", nombre: "Sesquilé" },
  { slug: "la-calera", nombre: "La Calera" },
  { slug: "villeta", nombre: "Villeta" },
  { slug: "raquira", nombre: "Ráquira" },
  { slug: "chiquinquira", nombre: "Chiquinquirá" }
];
