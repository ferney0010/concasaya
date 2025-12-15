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
const blogList = document.getElementById("blog-list");
const cancelBlogEditBtn = document.getElementById("cancel-blog-edit");

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
      "flex justify-between items-center bg-gray-50 p-2 rounded";
    catDiv.innerHTML = `
            <span>${cat.name}</span>
            <button data-id="${cat.id}" class="delete-category-btn text-red-500 hover:text-red-700 text-xl font-bold">&times;</button>
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

const uploadFile = async (file) => {
  const fileName = `public/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
  const { error } = await supabase.storage
    .from("concasaya_media")
    .upload(fileName, file);
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
  const title = galleryTitleInput.value;
  const category_id = galleryCategorySelect.value;
  const file = galleryImageInput.files[0];

  let imageUrl;
  if (file) {
    imageUrl = await uploadFile(file);
    if (!imageUrl) return alert("Error al subir la imagen.");
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
  } else {
    galleryForm.reset();
    galleryIdInput.value = "";
    await loadGalleryImages();
  }
});

const loadGalleryImages = async () => {
  const { data, error } = await supabase
    .from("concasaya_gallery_images")
    .select(`*, concasaya_gallery_categories(name)`)
    .order("created_at", { ascending: false });
  if (error) return;

  galleryList.innerHTML = "";
  data.forEach((img) => {
    const div = document.createElement("div");
    div.className = "relative group border rounded-md overflow-hidden";
    div.innerHTML = `
            <img src="${img.image_url}" class="w-full h-24 object-cover">
            <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button data-id="${img.id}" class="edit-gallery-btn text-white text-sm">Editar</button>
                <button data-id="${img.id}" data-url="${img.image_url}" class="delete-gallery-btn text-red-400 text-sm">Eliminar</button>
            </div>
            <p class="text-xs p-1 bg-gray-50 truncate">${img.title}</p>
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
    galleryForm.scrollIntoView({ behavior: "smooth" });
  }
});

cancelGalleryEditBtn.addEventListener("click", () => {
  galleryIdInput.value = "";
  galleryForm.reset();
});

blogForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = blogIdInput.value;
  const title = blogTitleInput.value;
  const content = blogContentInput.value;
  const file = blogImageInput.files[0];

  let imageUrl;
  if (file) {
    imageUrl = await uploadFile(file);
    if (!imageUrl) return alert("Error al subir la imagen del blog.");
  }

  const dataToSave = { title, content };
  if (imageUrl) dataToSave.image_url = imageUrl;

  const { error } = id
    ? await supabase
        .from("concasaya_blog_posts")
        .update(dataToSave)
        .eq("id", id)
    : await supabase.from("concasaya_blog_posts").insert(dataToSave);

  if (error) {
    alert("Error al guardar la entrada: " + error.message);
  } else {
    blogForm.reset();
    blogIdInput.value = "";
    await loadBlogPosts();
  }
});

const loadBlogPosts = async () => {
  const { data, error } = await supabase
    .from("concasaya_blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return;

  blogList.innerHTML = "";
  data.forEach((post) => {
    const div = document.createElement("div");
    div.className = "flex items-start gap-4 p-2 border rounded-md bg-white";
    div.innerHTML = `
            ${
              post.image_url
                ? `<img src="${post.image_url}" class="w-20 h-20 object-cover rounded">`
                : '<div class="w-20 h-20 bg-gray-200 rounded"></div>'
            }
            <div class="flex-grow">
                <h4 class="font-bold">${post.title}</h4>
                <p class="text-sm text-gray-600">${(
                  post.content || ""
                ).substring(0, 50)}...</p>
            </div>
            <div class="flex flex-col gap-2">
                <button data-id="${
                  post.id
                }" class="edit-blog-btn text-blue-500 hover:text-blue-700">Editar</button>
                <button data-id="${post.id}" data-url="${
      post.image_url || ""
    }" class="delete-blog-btn text-red-500 hover:text-red-700">Eliminar</button>
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
    blogForm.scrollIntoView({ behavior: "smooth" });
  }
});

cancelBlogEditBtn.addEventListener("click", () => {
  blogIdInput.value = "";
  blogForm.reset();
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
});
