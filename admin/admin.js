import { supabase } from "../supabaseClient.js";

// Verificar que supabase se haya cargado correctamente
if (!supabase || !supabase.auth) {
  console.error("Error: El cliente de Supabase no se inicializó correctamente");
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0d1b2a; color: #fff; padding: 20px;">
      <div style="text-align: center;">
        <h1 style="color: #ff4444; margin-bottom: 20px;">Error de Configuración</h1>
        <p>No se pudo inicializar el cliente de Supabase. Por favor, verifica la consola para más detalles.</p>
      </div>
    </div>
  `;
}

const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const authError = document.getElementById("auth-error");

const galleryForm = document.getElementById("gallery-form");
const galleryIdInput = document.getElementById("gallery-id");
const galleryTitleInput = document.getElementById("gallery-title");
const galleryCategorySelect = document.getElementById("gallery-category");
const galleryImageInput = document.getElementById("gallery-image");
const galleryList = document.getElementById("gallery-list");
const cancelGalleryEditBtn = document.getElementById("cancel-gallery-edit");

const categoryForm = document.getElementById("category-form");
const categoryNameInput = document.getElementById("category-name");
const categoriesList = document.getElementById("categories-list");

const blogForm = document.getElementById("blog-form");
const blogIdInput = document.getElementById("blog-id");
const blogTitleInput = document.getElementById("blog-title");
const blogContentInput = document.getElementById("blog-content");
const blogImageInput = document.getElementById("blog-image");
const blogCtaTextInput = document.getElementById("blog-cta-text");
const blogCtaUrlInput = document.getElementById("blog-cta-url");
const blogList = document.getElementById("blog-list");
const cancelBlogEditBtn = document.getElementById("cancel-blog-edit");

// Elementos de preview de imágenes
const galleryUploadArea = document.getElementById("gallery-upload-area");
const galleryUploadContent = document.getElementById("gallery-upload-content");
const galleryPreview = document.getElementById("gallery-preview");
const galleryPreviewImg = document.getElementById("gallery-preview-img");
const galleryRemovePreview = document.getElementById("gallery-remove-preview");
const galleryLoading = document.getElementById("gallery-loading");
const gallerySubmitBtn = document.getElementById("gallery-submit-btn");

const blogUploadArea = document.getElementById("blog-upload-area");
const blogUploadContent = document.getElementById("blog-upload-content");
const blogPreview = document.getElementById("blog-preview");
const blogPreviewImg = document.getElementById("blog-preview-img");
const blogRemovePreview = document.getElementById("blog-remove-preview");
const blogLoading = document.getElementById("blog-loading");
const blogSubmitBtn = document.getElementById("blog-submit-btn");

// Elementos de pestañas
const tabGallery = document.getElementById("tab-gallery");
const tabBlog = document.getElementById("tab-blog");
const galleryManagement = document.getElementById("gallery-management");
const blogManagement = document.getElementById("blog-management");

// Sistema de pestañas
const switchTab = (tabName) => {
  // Remover clase active de todos los botones y contenidos
  [tabGallery, tabBlog].forEach(btn => btn.classList.remove("active"));
  [galleryManagement, blogManagement].forEach(content => content.classList.remove("active"));

  // Activar la pestaña seleccionada
  if (tabName === "gallery") {
    tabGallery.classList.add("active");
    galleryManagement.classList.add("active");
  } else if (tabName === "blog") {
    tabBlog.classList.add("active");
    blogManagement.classList.add("active");
  }
};

// Event listeners para las pestañas
if (tabGallery) {
  tabGallery.addEventListener("click", () => switchTab("gallery"));
}

if (tabBlog) {
  tabBlog.addEventListener("click", () => switchTab("blog"));
}

const checkUserSession = async () => {
  try {
    if (!supabase || !supabase.auth) {
      throw new Error("El cliente de Supabase no está disponible");
    }
    
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error al verificar sesión:", error);
      authError.textContent = "Error al verificar la sesión. Por favor, recarga la página.";
      return;
    }
    
    if (session) {
      loginSection.classList.add("hidden");
      adminPanel.classList.remove("hidden");
      loadInitialData();
      // Inicializar uploads después de que el panel sea visible
      setTimeout(() => {
        initializeImageUploads();
      }, 300);
    } else {
      loginSection.classList.remove("hidden");
      adminPanel.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error en checkUserSession:", error);
    authError.textContent = "Error de conexión. Por favor, recarga la página.";
  }
};

const loadInitialData = async () => {
  await loadCategories();
  await loadGalleryImages();
  await loadBlogPosts();
};

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!supabase || !supabase.auth) {
    authError.textContent = "Error: El cliente de Supabase no está disponible. Por favor, recarga la página.";
    return;
  }
  
  const email = e.target.email.value;
  const password = e.target.password.value;
  
  authError.textContent = "";
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("Error de autenticación:", error);
      authError.textContent = error.message || "Correo o contraseña incorrectos.";
    } else {
      authError.textContent = "";
      checkUserSession();
    }
  } catch (error) {
    console.error("Error inesperado en login:", error);
    authError.textContent = "Error de conexión. Por favor, intenta de nuevo.";
  }
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  checkUserSession();
});

const loadCategories = async () => {
  const { data, error } = await supabase
    .from("concasaya_gallery_categories")
    .select("*")
    .order("name");
  if (error) return;

  galleryCategorySelect.innerHTML =
    '<option value="">Selecciona una categoría</option>';
  categoriesList.innerHTML = "";

  data.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    galleryCategorySelect.appendChild(option);

    const catDiv = document.createElement("div");
    catDiv.className =
      "flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors";
    catDiv.innerHTML = `
            <span class="text-gray-200 font-medium">${cat.name}</span>
            <button data-id="${cat.id}" class="delete-category-btn text-red-400 hover:text-red-300 text-lg font-bold px-2 py-1 rounded hover:bg-red-900/20 transition-colors" title="Eliminar categoría">
                <i class="fas fa-trash"></i>
            </button>
        `;
    categoriesList.appendChild(catDiv);
  });
};

categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = categoryNameInput.value.trim();
  if (!name) return;

  const { error } = await supabase
    .from("concasaya_gallery_categories")
    .insert({ name });
  if (error) {
    alert("Error al crear categoría: " + error.message);
  } else {
    categoryNameInput.value = "";
    await loadCategories();
  }
});

categoriesList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-category-btn")) {
    const id = e.target.dataset.id;
    if (
      confirm(
        "¿Seguro que quieres eliminar esta categoría? Las imágenes en esta categoría no se eliminarán pero quedarán sin categoría."
      )
    ) {
      const { error } = await supabase
        .from("concasaya_gallery_categories")
        .delete()
        .eq("id", id);
      if (error) alert("Error al eliminar categoría: " + error.message);
      else await loadCategories();
    }
  }
});

// Funciones de preview de imágenes
const setupImagePreview = (input, preview, previewImg, uploadContent, removeBtn) => {
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      preview.classList.remove('hidden');
      uploadContent.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  };

  input.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  removeBtn.addEventListener('click', () => {
    input.value = '';
    preview.classList.add('hidden');
    uploadContent.classList.remove('hidden');
  });
};

// Setup drag and drop
const setupDragAndDrop = (area, input) => {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    area.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    area.addEventListener(eventName, () => {
      area.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    area.addEventListener(eventName, () => {
      area.classList.remove('dragover');
    }, false);
  });

  area.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      input.files = files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, false);

  area.addEventListener('click', () => {
    input.click();
  });
};

// Inicializar previews y drag & drop cuando el panel esté visible
const initializeImageUploads = () => {
  if (galleryUploadArea && galleryImageInput) {
    setupImagePreview(
      galleryImageInput,
      galleryPreview,
      galleryPreviewImg,
      galleryUploadContent,
      galleryRemovePreview
    );
    setupDragAndDrop(galleryUploadArea, galleryImageInput);
  }

  if (blogUploadArea && blogImageInput) {
    setupImagePreview(
      blogImageInput,
      blogPreview,
      blogPreviewImg,
      blogUploadContent,
      blogRemovePreview
    );
    setupDragAndDrop(blogUploadArea, blogImageInput);
  }
};

const uploadFile = async (file, showLoading = null) => {
  if (showLoading) {
    showLoading.classList.remove('hidden');
  }
  
  const fileName = `public/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
  const { error } = await supabase.storage
    .from("concasaya_media")
    .upload(fileName, file);
  
  if (showLoading) {
    showLoading.classList.add('hidden');
  }
  
  if (error) {
    console.error("Upload error:", error);
    return null;
  }
  const { data } = supabase.storage
    .from("concasaya_media")
    .getPublicUrl(fileName);
  return data.publicUrl;
};

galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = galleryIdInput.value;
  const title = galleryTitleInput.value.trim();
  const category_id = galleryCategorySelect.value;
  const file = galleryImageInput.files[0];

  if (!title) {
    alert("Por favor, ingresa un título para la imagen");
    return;
  }

  if (!category_id) {
    alert("Por favor, selecciona una categoría");
    return;
  }

  if (!id && !file) {
    alert("Por favor, selecciona una imagen para subir");
    return;
  }

  gallerySubmitBtn.disabled = true;
  gallerySubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

  let imageUrl;
  if (file) {
    imageUrl = await uploadFile(file, galleryLoading);
    if (!imageUrl) {
      alert("Error al subir la imagen. Por favor, intenta de nuevo.");
      gallerySubmitBtn.disabled = false;
      gallerySubmitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Imagen';
      return;
    }
  }

  const dataToSave = { title, category_id };
  if (imageUrl) dataToSave.image_url = imageUrl;

  const { error } = id
    ? await supabase
        .from("concasaya_gallery_images")
        .update(dataToSave)
        .eq("id", id)
    : await supabase.from("concasaya_gallery_images").insert(dataToSave);

  if (error) {
    alert("Error al guardar la imagen: " + error.message);
    gallerySubmitBtn.disabled = false;
    gallerySubmitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Imagen';
  } else {
    galleryForm.reset();
    galleryIdInput.value = "";
    galleryPreview.classList.add('hidden');
    galleryUploadContent.classList.remove('hidden');
    gallerySubmitBtn.disabled = false;
    gallerySubmitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Imagen';
    await loadGalleryImages();
    alert("¡Imagen guardada exitosamente!");
  }
});

const loadGalleryImages = async () => {
  const { data, error } = await supabase
    .from("concasaya_gallery_images")
    .select(`*, concasaya_gallery_categories(name)`)
    .order("created_at", { ascending: false });
  if (error) return;

  galleryList.innerHTML = "";
  if (data.length === 0) {
    galleryList.innerHTML = '<p class="text-gray-400 text-center py-8 col-span-full">No hay imágenes subidas aún</p>';
    return;
  }

  data.forEach((img) => {
    const div = document.createElement("div");
    div.className = "relative group border border-gray-700 rounded-lg overflow-hidden bg-gray-800 hover:border-brand-primary transition-all";
    div.innerHTML = `
            <img src="${img.image_url}" class="w-full h-32 md:h-40 object-cover" loading="lazy" alt="${img.title}">
            <div class="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button data-id="${img.id}" class="edit-gallery-btn px-4 py-2 text-white bg-brand-primary rounded hover:bg-blue-600 transition-colors text-sm font-medium">
                    <i class="fas fa-edit mr-1"></i>Editar
                </button>
                <button data-id="${img.id}" data-url="${img.image_url}" class="delete-gallery-btn px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors text-sm font-medium">
                    <i class="fas fa-trash mr-1"></i>Eliminar
                </button>
            </div>
            <div class="p-2 bg-gray-800">
                <p class="text-xs text-gray-300 truncate font-medium">${img.title}</p>
                <p class="text-xs text-gray-500 mt-1">${img.concasaya_gallery_categories?.name || 'Sin categoría'}</p>
            </div>
        `;
    galleryList.appendChild(div);
  });
};

galleryList.addEventListener("click", async (e) => {
  const target = e.target;
  const id = target.dataset.id;

  if (target.classList.contains("delete-gallery-btn")) {
    if (confirm("¿Seguro que quieres eliminar esta imagen?")) {
      const { error: deleteError } = await supabase
        .from("concasaya_gallery_images")
        .delete()
        .eq("id", id);
      if (deleteError) {
        alert("Error al eliminar: " + deleteError.message);
      } else {
        const url = new URL(target.dataset.url);
        const path = url.pathname.split("/concasaya_media/")[1];
        await supabase.storage.from("concasaya_media").remove([path]);
        await loadGalleryImages();
      }
    }
  } else if (target.classList.contains("edit-gallery-btn")) {
    const { data, error } = await supabase
      .from("concasaya_gallery_images")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return;
    galleryIdInput.value = data.id;
    galleryTitleInput.value = data.title;
    galleryCategorySelect.value = data.category_id;
    // Mostrar preview de la imagen existente
    if (data.image_url) {
      galleryPreviewImg.src = data.image_url;
      galleryPreview.classList.remove('hidden');
      galleryUploadContent.classList.add('hidden');
    }
    galleryForm.scrollIntoView({ behavior: "smooth" });
  }
});

cancelGalleryEditBtn.addEventListener("click", () => {
  galleryIdInput.value = "";
  galleryForm.reset();
  galleryPreview.classList.add('hidden');
  galleryUploadContent.classList.remove('hidden');
});

blogForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = blogIdInput.value;
  const title = blogTitleInput.value.trim();
  const content = blogContentInput.value.trim();
  const ctaText = blogCtaTextInput.value.trim();
  const ctaUrl = blogCtaUrlInput.value.trim();
  const file = blogImageInput.files[0];

  if (!title) {
    alert("Por favor, ingresa un título para la entrada");
    return;
  }

  if (!content) {
    alert("Por favor, ingresa el contenido de la entrada");
    return;
  }

  if (!id && !file) {
    alert("Por favor, selecciona una imagen principal para la entrada");
    return;
  }

  // Validar CTA si se proporciona
  if (ctaText && !ctaUrl) {
    alert("Por favor, ingresa una URL de destino para el botón CTA");
    return;
  }
  if (!ctaText && ctaUrl) {
    alert("Por favor, ingresa el texto del botón CTA");
    return;
  }

  blogSubmitBtn.disabled = true;
  blogSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Publicando...';

  let imageUrl;
  if (file) {
    imageUrl = await uploadFile(file, blogLoading);
    if (!imageUrl) {
      alert("Error al subir la imagen. Por favor, intenta de nuevo.");
      blogSubmitBtn.disabled = false;
      blogSubmitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Publicar Entrada';
      return;
    }
  }

  const dataToSave = { title, content };
  if (imageUrl) dataToSave.image_url = imageUrl;
  if (ctaText && ctaUrl) {
    dataToSave.cta_text = ctaText;
    dataToSave.cta_url = ctaUrl;
  } else {
    // Si no hay CTA, asegurarse de limpiar campos anteriores
    dataToSave.cta_text = null;
    dataToSave.cta_url = null;
  }

  const { error } = id
    ? await supabase
        .from("concasaya_blog_posts")
        .update(dataToSave)
        .eq("id", id)
    : await supabase.from("concasaya_blog_posts").insert(dataToSave);

  if (error) {
    alert("Error al guardar la entrada: " + error.message);
    blogSubmitBtn.disabled = false;
    blogSubmitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Publicar Entrada';
  } else {
    blogForm.reset();
    blogIdInput.value = "";
    blogCtaTextInput.value = "";
    blogCtaUrlInput.value = "";
    blogPreview.classList.add('hidden');
    blogUploadContent.classList.remove('hidden');
    blogSubmitBtn.disabled = false;
    blogSubmitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Publicar Entrada';
    await loadBlogPosts();
    alert("¡Entrada publicada exitosamente!");
  }
});

const loadBlogPosts = async () => {
  const { data, error } = await supabase
    .from("concasaya_blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return;

  blogList.innerHTML = "";
  if (data.length === 0) {
    blogList.innerHTML = '<p class="text-gray-400 text-center py-8">No hay entradas publicadas aún</p>';
    return;
  }

  data.forEach((post) => {
    const div = document.createElement("div");
    div.className = "flex flex-col sm:flex-row items-start gap-4 p-4 border border-gray-700 rounded-lg bg-gray-800 hover:border-brand-primary transition-all";
    const date = new Date(post.created_at).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    div.innerHTML = `
            ${
              post.image_url
                ? `<img src="${post.image_url}" class="w-full sm:w-24 h-24 object-cover rounded-lg flex-shrink-0" loading="lazy" alt="${post.title}">`
                : '<div class="w-full sm:w-24 h-24 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center"><i class="fas fa-image text-gray-600"></i></div>'
            }
            <div class="flex-grow min-w-0">
                <h4 class="font-bold text-white text-lg mb-1">${post.title}</h4>
                <p class="text-xs text-gray-400 mb-2">${date}</p>
                <p class="text-sm text-gray-300 line-clamp-2 mb-2">${(
                  post.content || ""
                ).substring(0, 100)}${post.content && post.content.length > 100 ? '...' : ''}</p>
                ${post.cta_text && post.cta_url ? `
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">CTA: ${post.cta_text}</span>
                        <span class="text-xs text-gray-500">→ ${post.cta_url}</span>
                    </div>
                ` : ''}
            </div>
            <div class="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                <button data-id="${
                  post.id
                }" class="edit-blog-btn px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex-1 sm:flex-none">
                    <i class="fas fa-edit mr-1"></i>Editar
                </button>
                <button data-id="${post.id}" data-url="${
      post.image_url || ""
    }" class="delete-blog-btn px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex-1 sm:flex-none">
                    <i class="fas fa-trash mr-1"></i>Eliminar
                </button>
            </div>
        `;
    blogList.appendChild(div);
  });
};

blogList.addEventListener("click", async (e) => {
  const target = e.target;
  const id = target.dataset.id;

  if (target.classList.contains("delete-blog-btn")) {
    if (confirm("¿Seguro que quieres eliminar esta entrada del blog?")) {
      const { error } = await supabase
        .from("concasaya_blog_posts")
        .delete()
        .eq("id", id);
      if (error) {
        alert("Error al eliminar: " + error.message);
      } else {
        if (target.dataset.url) {
          const url = new URL(target.dataset.url);
          const path = url.pathname.split("/concasaya_media/")[1];
          await supabase.storage.from("concasaya_media").remove([path]);
        }
        await loadBlogPosts();
      }
    }
  } else if (target.classList.contains("edit-blog-btn")) {
    const { data, error } = await supabase
      .from("concasaya_blog_posts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return;
    blogIdInput.value = data.id;
    blogTitleInput.value = data.title;
    blogContentInput.value = data.content;
    blogCtaTextInput.value = data.cta_text || "";
    blogCtaUrlInput.value = data.cta_url || "";
    // Mostrar preview de la imagen existente
    if (data.image_url) {
      blogPreviewImg.src = data.image_url;
      blogPreview.classList.remove('hidden');
      blogUploadContent.classList.add('hidden');
    }
    blogForm.scrollIntoView({ behavior: "smooth" });
  }
});

cancelBlogEditBtn.addEventListener("click", () => {
  blogIdInput.value = "";
  blogForm.reset();
  blogCtaTextInput.value = "";
  blogCtaUrlInput.value = "";
  blogPreview.classList.add('hidden');
  blogUploadContent.classList.remove('hidden');
});

// Esperar a que el DOM esté listo y verificar que supabase esté disponible
document.addEventListener("DOMContentLoaded", () => {
  if (!supabase || !supabase.auth) {
    console.error("Supabase no está disponible al cargar la página");
    if (authError) {
      authError.textContent = "Error de configuración. Por favor, recarga la página.";
    }
    return;
  }
  checkUserSession();
  
  // Inicializar uploads cuando el panel esté visible
  setTimeout(() => {
    if (!adminPanel.classList.contains('hidden')) {
      initializeImageUploads();
    }
  }, 500);
});

// Observar cambios en la visibilidad del panel
const observer = new MutationObserver(() => {
  if (!adminPanel.classList.contains('hidden')) {
    initializeImageUploads();
  }
});

if (adminPanel) {
  observer.observe(adminPanel, { attributes: true, attributeFilter: ['class'] });
}
