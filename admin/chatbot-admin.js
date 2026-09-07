const editSection = document.getElementById("edit-section");
const knowledgeTextarea = document.getElementById("knowledge-textarea");
const saveButton = document.getElementById("save-button");
const saveButtonText = document.getElementById("save-button-text");
const saveSpinner = document.getElementById("save-spinner");
const saveStatus = document.getElementById("save-status");
const adminThemeToggle = document.getElementById("admin-theme-toggle");
const adminThemeIconLight = document.getElementById("admin-theme-icon-light");
const adminThemeIconDark = document.getElementById("admin-theme-icon-dark");

const KNOWLEDGE_BASE_URL = "/knowledge_base.json";
let originalKnowledge = "";

function updateAdminThemeIcons(isDark) {
  if (!adminThemeIconLight || !adminThemeIconDark) return;
  if (isDark) {
    adminThemeIconLight.classList.remove("hidden");
    adminThemeIconLight.classList.add("inline");
    adminThemeIconDark.classList.add("hidden");
    adminThemeIconDark.classList.remove("inline");
  } else {
    adminThemeIconLight.classList.add("hidden");
    adminThemeIconLight.classList.remove("inline");
    adminThemeIconDark.classList.remove("hidden");
    adminThemeIconDark.classList.add("inline");
  }
}

function toggleAdminTheme() {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("adminTheme", isDark ? "dark" : "light");
  updateAdminThemeIcons(isDark);
}

function loadAdminTheme() {
  const savedTheme = localStorage.getItem("adminTheme");
  const initialTheme = savedTheme ?? "dark";
  if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
    updateAdminThemeIcons(true);
  } else {
    document.documentElement.classList.remove("dark");
    updateAdminThemeIcons(false);
  }
}

function showEditor() {
  editSection.classList.remove("hidden");
  loadKnowledge();
}

function setSaveButtonState(isLoading, message = "", isError = false) {
  if (!saveButton || !saveButtonText || !saveSpinner || !saveStatus) return;

  saveStatus.textContent = message;
  saveStatus.classList.toggle("text-red-500", isError);
  saveStatus.classList.toggle("dark:text-red-400", isError);
  saveStatus.classList.toggle("text-green-500", !isError);
  saveStatus.classList.toggle("dark:text-green-400", !isError);

  if (isLoading) {
    saveButton.disabled = true;
    knowledgeTextarea.disabled = true;
    saveButtonText.textContent = "Guardando...";
    saveSpinner.classList.remove("hidden");
  } else {
    knowledgeTextarea.disabled = false;
    saveButton.disabled = knowledgeTextarea.value === originalKnowledge;
    saveButtonText.textContent = "Guardar Cambios";
    saveSpinner.classList.add("hidden");
    if (!isError && message && !message.startsWith("Cargando")) {
      setTimeout(() => {
        if (saveStatus.textContent === message && !saveStatus.classList.contains('text-red-500')) {
           saveStatus.textContent = "";
        }
      }, 3000);
    }
  }
}

async function loadKnowledge() {
  if (!knowledgeTextarea) return;
  knowledgeTextarea.value = "";
  originalKnowledge = "";
  setSaveButtonState(true, "Cargando contenido desde JSON...");

  try {
    const response = await fetch(KNOWLEDGE_BASE_URL);
    
    if (!response.ok) {
      throw new Error(`Error al cargar JSON: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.knowledge_content !== null) {
      originalKnowledge = data.knowledge_content;
      knowledgeTextarea.value = originalKnowledge;
      setSaveButtonState(false, "Contenido cargado desde JSON.");
    } else {
      // Intentar cargar desde localStorage como backup
      const savedKnowledge = localStorage.getItem('concasaya_knowledge_backup');
      if (savedKnowledge) {
        originalKnowledge = savedKnowledge;
        knowledgeTextarea.value = originalKnowledge;
        setSaveButtonState(false, "Contenido cargado desde localStorage (backup).");
      } else {
        originalKnowledge = "";
        knowledgeTextarea.value = "";
        setSaveButtonState(
          false,
          "No se encontró contenido. Puedes añadirlo y guardar."
        );
      }
    }
  } catch (error) {
    console.error("Error al cargar contenido:", error);
    // Intentar cargar desde localStorage como fallback
    const savedKnowledge = localStorage.getItem('concasaya_knowledge_backup');
    if (savedKnowledge) {
      originalKnowledge = savedKnowledge;
      knowledgeTextarea.value = originalKnowledge;
      setSaveButtonState(false, "Contenido cargado desde localStorage (fallback).");
    } else {
      knowledgeTextarea.value = `Error al cargar datos: ${error.message}`;
      setSaveButtonState(false, `Error al cargar: ${error.message}`, true);
    }
  }
}

async function saveKnowledge() {
  if (saveButton.disabled) return;

  const newKnowledge = knowledgeTextarea.value.trim();
  setSaveButtonState(true, "Guardando...");

  try {
    // Guardar en localStorage como backup inmediato
    localStorage.setItem('concasaya_knowledge_backup', newKnowledge);
    
    originalKnowledge = newKnowledge;
    setSaveButtonState(false, "¡Guardado en localStorage! Nota: Para guardar permanentemente, actualiza el archivo knowledge_base.json en el servidor.");
    
    // Mostrar instrucciones para actualizar el archivo manualmente
    console.log("Para guardar permanentemente:");
    console.log("1. Copia el contenido del textarea");
    console.log("2. Abre knowledge_base.json");
    console.log("3. Reemplaza el campo 'knowledge_content' con el nuevo contenido");
    console.log("4. Guarda el archivo");
    
    // Opcional: Mostrar un mensaje más visible
    setTimeout(() => {
      if (confirm("¿Deseas copiar el contenido al portapapeles para actualizar el archivo JSON manualmente?")) {
        navigator.clipboard.writeText(newKnowledge).then(() => {
          setSaveButtonState(false, "¡Contenido copiado al portapapeles! Pega en knowledge_base.json y guarda.");
        }).catch(() => {
          setSaveButtonState(false, "Error al copiar. Guarda manualmente desde el textarea.");
        });
      }
    }, 500);
    
  } catch (error) {
    console.error("Error al guardar contenido:", error);
    setSaveButtonState(false, `Error al guardar: ${error.message}`, true);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  loadAdminTheme();
  
  // Mostrar el editor directamente (sin autenticación)
  showEditor();

  if (adminThemeToggle)
    adminThemeToggle.addEventListener("click", toggleAdminTheme);
  if (saveButton) saveButton.addEventListener("click", saveKnowledge);

  if (knowledgeTextarea && saveButton) {
    knowledgeTextarea.addEventListener("input", () => {
       const hasChanged = knowledgeTextarea.value !== originalKnowledge;
       const isLoading = !saveSpinner.classList.contains("hidden");
       saveButton.disabled = !hasChanged || isLoading;
        if (saveStatus.textContent && hasChanged) {
           saveStatus.textContent = "";
        }
    });
  }
});
