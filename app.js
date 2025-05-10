// app.js
import { initializeApp }               from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA253FVFRHLUEEgCaZy5RaqXqZLrNBUSyo",
  authDomain: "appkenya-1d177.firebaseapp.com",
  projectId: "appkenya-1d177",
  storageBucket: "appkenya-1d177.appspot.com",
  messagingSenderId: "810287051159",
  appId: "1:810287051159:web:7ae0af167863f72c4b14d2",
  measurementId: "G-KHZZVRMBTB"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Mostrar productos
async function showProducts() {
  const snap = await getDocs(collection(db, "coleccion"));
  const container = document.getElementById("products");
  container.innerHTML = "";

  snap.forEach(docSnap => {
    const data = docSnap.data();
    const id   = docSnap.id;

    const card = document.createElement("div");
    card.classList.add("product");

    // Imagen
    const img = document.createElement("img");
    img.src = data.imagePath || "https://via.placeholder.com/280x200";
    card.appendChild(img);

    // Detalles ocultos
    const details = document.createElement("div");
    details.classList.add("product-details");
    details.innerHTML = `
      <h2>${data.name}</h2>
      <p>${data.description}</p>
      <p class="price">$${data.price.toFixed(2)}</p>
    `;
    card.appendChild(details);

    card.addEventListener("click", () => card.classList.toggle("expanded"));

    // Botones editar/eliminar
    const actions = document.createElement("div");
    actions.classList.add("card-actions");
    actions.innerHTML = `
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">🗑️</button>
    `;
    card.appendChild(actions);

    // Delete
    actions.querySelector(".delete-btn").addEventListener("click", async e => {
      e.stopPropagation();
      await deleteDoc(doc(db, "coleccion", id));
      showProducts();
    });

    // Edit
    actions.querySelector(".edit-btn").addEventListener("click", e => {
      e.stopPropagation();
      openEditModal(id, data);
    });

    container.appendChild(card);
  });
}

// ——— AGREGAR PRODUCTOS ———
const addBtn      = document.getElementById("addProductBtn");
const addModal    = document.getElementById("addProductModal");
const closeAdd    = document.getElementById("closeAddModal");
const addForm     = document.getElementById("addProductForm");

addBtn.addEventListener("click", () => addModal.style.display = "block");
closeAdd.addEventListener("click", () => addModal.style.display = "none");

addForm.addEventListener("submit", async e => {
  e.preventDefault();
  await addDoc(collection(db, "coleccion"), {
    name:        addForm['addName'].value,
    description: addForm['addDescription'].value,
    price:       parseFloat(addForm['addPrice'].value),
    imagePath:   addForm['addImage'].value
  });
  addForm.reset();
  addModal.style.display = "none";
  showProducts();
});

// ——— EDITAR PRODUCTOS ———
const editModal   = document.getElementById("editProductModal");
const closeEdit   = document.getElementById("closeEditModal");
const editForm    = document.getElementById("editProductForm");

closeEdit.addEventListener("click", () => editModal.style.display = "none");

function openEditModal(id, data) {
  editForm['editId'].value          = id;
  editForm['editName'].value        = data.name;
  editForm['editDescription'].value = data.description;
  editForm['editPrice'].value       = data.price;
  editForm['editImage'].value       = data.imagePath;
  editModal.style.display = "block";
}

editForm.addEventListener("submit", async e => {
  e.preventDefault();
  const id = editForm['editId'].value;
  const ref = doc(db, "coleccion", id);
  await updateDoc(ref, {
    name:        editForm['editName'].value,
    description: editForm['editDescription'].value,
    price:       parseFloat(editForm['editPrice'].value),
    imagePath:   editForm['editImage'].value
  });
  editModal.style.display = "none";
  showProducts();
});

// Inicial
window.addEventListener("DOMContentLoaded", showProducts);

// ——— EXPORTAR A CSV ———
document.getElementById("exportCsvBtn").addEventListener("click", async () => {
  const snap = await getDocs(collection(db, "coleccion"));
  // Cabeceras CSV
  const rows = [
    ["ID","Nombre","Descripción","Precio","URL Imagen"]
  ];
  snap.forEach(docSnap => {
    const d = docSnap.data();
    rows.push([
      docSnap.id,
      `"${d.name.replace(/"/g,'""')}"`,
      `"${d.description.replace(/"/g,'""')}"`,
      d.price,
      d.imagePath
    ]);
  });
  // Generar texto CSV
  const csvContent = rows.map(r => r.join(",")).join("\r\n");
  // Descargar
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "productos.csv";
  a.click();
  URL.revokeObjectURL(url);


  
});
