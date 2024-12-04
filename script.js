// Variables globales
let products = JSON.parse(localStorage.getItem("products")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let editingItem = null;
let editingType = null;

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderTables();
  document
    .getElementById("addProductBtn")
    .addEventListener("click", () => showModal("product", "add"));
  document
    .getElementById("addCategoryBtn")
    .addEventListener("click", () => showModal("category", "add"));
  document
    .getElementById("saveChangesBtn")
    .addEventListener("click", saveChanges);
});

// Renderizar tablas
function renderTables() {
  const productsTable = document.getElementById("productsTableBody");
  const categoriesTable = document.getElementById("categoriesTableBody");

  productsTable.innerHTML = products
    .map(
      (product) => `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${
        categories.find((cat) => cat.id === product.categoryId)?.name ||
        "Sin Categoría"
      }</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editItem('product', ${
          product.id
        })"><i class="fa fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem('product', ${
          product.id
        })"><i class="fa fa-trash"></i></button>
      </td>
    </tr>`
    )
    .join("");

  categoriesTable.innerHTML = categories
    .map(
      (category) => `
    <tr>
      <td>${category.id}</td>
      <td>${category.name}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editItem('category', ${category.id})"><i class="fa fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem('category', ${category.id})"><i class="fa fa-trash"></i></button>
      </td>
    </tr>`
    )
    .join("");
}

// Mostrar modal
function showModal(type, action) {
  editingType = type;
  editingItem = null;
  document.getElementById("crudModalTitle").innerText =
    action === "add"
      ? `Agregar ${type === "product" ? "Producto" : "Categoría"}`
      : `Editar ${type === "product" ? "Producto" : "Categoría"}`;
  document.getElementById("categoryInputGroup").style.display =
    type === "category" ? "block" : "none";
  document.getElementById("productInputGroup").style.display =
    type === "product" ? "block" : "none";

  if (type === "product") {
    const productCategory = document.getElementById("productCategory");
    productCategory.innerHTML = categories
      .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");
  }

  document.getElementById("crudForm").reset();
  new bootstrap.Modal(document.getElementById("crudModal")).show();
}

// Guardar cambios
function saveChanges() {
  if (editingType === "category") {
    const name = document.getElementById("categoryName").value.trim();
    if (!name) {
      showAlert(
        "error",
        "Error",
        "El nombre de la categoría no puede estar vacío."
      );
      return;
    }
    if (editingItem) {
      editingItem.name = name;
      showAlert("success", "Categoría actualizada con éxito");
    } else {
      categories.push({ id: Date.now(), name });
      showAlert("success", "Categoría agregada con éxito");
    }
    localStorage.setItem("categories", JSON.stringify(categories));
  } else if (editingType === "product") {
    const name = document.getElementById("productName").value.trim();
    const categoryId = parseInt(
      document.getElementById("productCategory").value
    );
    if (!name) {
      showAlert(
        "error",
        "Error",
        "El nombre del producto no puede estar vacío."
      );
      return;
    }
    if (editingItem) {
      editingItem.name = name;
      editingItem.categoryId = categoryId;
      showAlert("success", "Producto actualizado con éxito");
    } else {
      products.push({ id: Date.now(), name, categoryId });
      showAlert("success", "Producto agregado con éxito");
    }
    localStorage.setItem("products", JSON.stringify(products));
  }
  renderTables();
  bootstrap.Modal.getInstance(document.getElementById("crudModal")).hide();
}

function editItem(type, id) {
  editingType = type;
  editingItem =
    type === "category"
      ? categories.find((cat) => cat.id === id)
      : products.find((prod) => prod.id === id);

  if (!editingItem) {
    showAlert("error", "Error", "No se encontró el elemento para editar.");
    return;
  }

  document.getElementById("crudModalTitle").innerText = `Editar ${
    type === "product" ? "Producto" : "Categoría"
  }`;

  if (type === "category") {
    // Mostrar grupo de inputs para categoría
    document.getElementById("categoryInputGroup").style.display = "block";
    document.getElementById("productInputGroup").style.display = "none";

    // Rellenar el campo con el nombre actual
    document.getElementById("categoryName").value = editingItem.name;
  } else {
    // Mostrar grupo de inputs para producto
    document.getElementById("categoryInputGroup").style.display = "none";
    document.getElementById("productInputGroup").style.display = "block";

    // Rellenar los campos con los valores actuales
    document.getElementById("productName").value = editingItem.name;
    const productCategory = document.getElementById("productCategory");
    productCategory.innerHTML = categories
      .map(
        (cat) =>
          `<option value="${cat.id}" ${
            cat.id === editingItem.categoryId ? "selected" : ""
          }>${cat.name}</option>`
      )
      .join("");
  }

  // Abrir el modal
  new bootstrap.Modal(document.getElementById("crudModal")).show();
}

// Editar ítem
function deleteItem(type, id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: `Esto eliminará permanentemente el ${
      type === "category" ? "categoría" : "producto"
    }.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      if (type === "category") {
        categories = categories.filter((cat) => cat.id !== id);
        localStorage.setItem("categories", JSON.stringify(categories));
      } else if (type === "product") {
        products = products.filter((prod) => prod.id !== id);
        localStorage.setItem("products", JSON.stringify(products));
      }
      renderTables();
      showAlert(
        "success",
        "Eliminado",
        `${type === "category" ? "Categoría" : "Producto"} eliminado con éxito.`
      );
    }
  });
}

function showAlert(icon, title, text = "") {
  Swal.fire({
    icon: icon, // 'success', 'error', 'warning', 'info', 'question'
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
    timer: 2000,
  });
}
