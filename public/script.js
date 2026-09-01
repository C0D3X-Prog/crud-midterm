const form = document.getElementById("item-form");
const itemIdInput = document.getElementById("item-id");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const quantityInput = document.getElementById("quantity");

const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");

const tableBody = document.getElementById("items-table-body");

loadItems();


async function loadItems() {
    try {
        const response = await fetch("/api/items");
        const items = await response.json();

        tableBody.innerHTML = "";

        items.forEach(item => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.id}</td>
                <td>${escapeHtml(item.item_name)}</td>
                <td>${escapeHtml(item.description || "")}</td>
                <td>${item.quantity}</td>
                <td>
                    <button
                        class="edit-button"
                        onclick='editItem(${JSON.stringify(item)})'
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteItem(${item.id})"
                    >
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading items:", error);
        alert("Failed to load items.");
    }
}



form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = itemIdInput.value;

    const item = {
        item_name: nameInput.value.trim(),
        description: descriptionInput.value.trim(),
        quantity: Number(quantityInput.value)
 };

    try {
        let response;

        if (id) {
     
            response = await fetch(`/api/items/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(item)
            });
        } else {
      
            response = await fetch("/api/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(item)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Operation failed");
        }

        resetForm();
        await loadItems();

    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
});


function editItem(item) {
    itemIdInput.value = item.id;
    nameInput.value = item.item_name;
    descriptionInput.value = item.description || "";
    quantityInput.value = item.quantity;

    formTitle.textContent = "Edit Item";
    submitButton.textContent = "Update Item";
    cancelButton.style.display = "inline-block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function deleteItem(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this item?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/items/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Delete failed");
        }

        await loadItems();

    } catch (error) {
        console.error("Delete error:", error);
        alert(error.message);
    }
}



cancelButton.addEventListener("click", () => {
    resetForm();
});



function resetForm() {
    form.reset();
    itemIdInput.value = "";

    formTitle.textContent = "Add Item";
    submitButton.textContent = "Add Item";
    cancelButton.style.display = "none";
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}