/**
 * Corrige el bloque AOS/DOMContentLoaded truncado en páginas internacionales.
 * Sin AOS.init() el contenido con data-aos queda invisible.
 */
const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "..", "pages");
const files = [
  "colombianos-estados-unidos.html",
  "colombianos-mexico.html",
  "colombianos-canada.html",
  "colombianos-espana.html",
  "colombianos-en-el-exterior.html",
  "casas-prefabricadas-colombia.html",
];

const FIXED_BLOCK = `    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
      AOS.init({ duration: 800, once: true });

      document.addEventListener("DOMContentLoaded", () => {
        const contactForm = document.getElementById("contact-form");
        if (!contactForm) return;
        contactForm.addEventListener("submit", (event) => {
          event.preventDefault();
          const name = document.getElementById("name")?.value || "";
          const phone = document.getElementById("phone")?.value || "";
          const email = document.getElementById("email")?.value || "";
          const city = document.getElementById("city")?.value || "";
          const message = document.getElementById("message")?.value || "";
          let text =
            "Hola CONCASAYA, me gustaría solicitar una cotización.\\n\\n" +
            "*Nombre:* " +
            name +
            "\\n*Teléfono:* " +
            phone +
            "\\n*Email:* " +
            email;
          if (city) text += "\\n*Ciudad:* " + city;
          text += "\\n\\n*Mensaje:*\\n" + message;
          window.open(
            "https://wa.me/573142891018?text=" + encodeURIComponent(text),
            "_blank"
          );
          contactForm.reset();
        });
      });
    </script>`;

const BROKEN_RE =
  /<script src="https:\/\/unpkg\.com\/aos@2\.3\.1\/dist\/aos\.js"><\/script>\s*<script>[\s\S]*?<\/script>\s*(?=<script src="\/assets\/js\/municipios\.js">)/;

let updated = 0;
for (const file of files) {
  const fp = path.join(pagesDir, file);
  if (!fs.existsSync(fp)) {
    console.log("No encontrado:", file);
    continue;
  }
  let content = fs.readFileSync(fp, "utf8");
  if (!BROKEN_RE.test(content)) {
    console.log("Sin cambio (patrón no coincide):", file);
    continue;
  }
  content = content.replace(BROKEN_RE, FIXED_BLOCK + "\n\n");
  fs.writeFileSync(fp, content, "utf8");
  updated++;
  console.log("Corregido:", file);
}

console.log("\nTotal corregidos:", updated);
