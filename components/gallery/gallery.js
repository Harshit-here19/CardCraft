const dbName = "CardCraftDB";
const storeName = "cards";

// In Deployement Enables this
let templates = [];

fetch("../../assests/templates.json")
  .then((res) => res.json())
  .then((data) => {
    templates = data.templates;
  });

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

let allCards = [];

async function loadGallery() {
  const db = await openDB();
  const tx = db.transaction("cards", "readonly");
  const store = tx.objectStore("cards");

  const req = store.getAll();

  req.onsuccess = () => {
    allCards = req.result || [];
    renderGallery(allCards);
    populateFilters(allCards);
  };
}

window.addEventListener("DOMContentLoaded", loadGallery);

function renderGallery(cards) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  if (cards.length === 0) {
    const isFiltered =
      document.getElementById("filterTemplate").value !== "all" ||
      document.getElementById("filterRarity").value !== "all" ||
      document.getElementById("filterGender").value !== "all" ||
      document.getElementById("filterSeries").value.trim() !== "";

    gallery.innerHTML = `
      <div class="empty-gallery">
        <div class="empty-gallery-icon">
          ${isFiltered ? "🔍" : "🗂️"}
        </div>

        <h2>
          ${isFiltered ? "No Matching Cards" : "No Cards Yet"}
        </h2>

        <p>
          ${
            isFiltered
              ? "Try adjusting your filters."
              : "Create your first card to get started."
          }
        </p>
      </div>
    `;

    return;
  }

  cards.forEach((card) => {
    gallery.appendChild(renderCard(card));
  });
}

function renderCard(cardData) {
  const template = templates.find((t) => t.id === cardData.templateId);

  // console.log(template?.background)
  // console.log(cardData.colors.color1)

  const wrapper = document.createElement("div");
  wrapper.className = "gallery-card-wrapper";

  wrapper.dataset.template = cardData.templateId;
  wrapper.dataset.rarity = cardData.rarity;
  wrapper.dataset.series = cardData.series;

  wrapper.innerHTML = `
        <button class="mini-card-delete-btn" onclick="event.stopPropagation() ;deleteCard('${cardData.id || ""}', this)">
            x
        </button>
        <div class="anime-card mini-card" style="
            background: ${(() => {
              if (cardData?.backgroundImage) {
                return `url(${cardData.backgroundImage}) center/cover no-repeat`;
              }

              const c1 = cardData?.colors?.color1;
              const c2 = cardData?.colors?.color2;
              const isBothWhite =
                c1?.toLowerCase() === "#ffffff" &&
                c2?.toLowerCase() === "#ffffff";

              if (c1 && !isBothWhite) {
                return `linear-gradient(135deg, ${c1}, ${c2 || c1})`;
              }

              return (
                template?.background || "linear-gradient(135deg, #ffffff45, #ffffff45)"
              );
            })()};
            color: ${cardData?.colors?.textColor || template?.textColor || "#fff"};
            border-color: ${template?.borderColor || "transparent"};
            font-family: ${cardData?.font || template?.font || "Poppins"};
            box-shadow: ${template?.cardShadow || "none"};
        ">
            
            <div class="shine"></div>
            <div class="rarity">${cardData.rarity || "Common"}</div>

            <div class="card-header">
                <h1>${cardData.name}</h1>
                <p>${cardData.series}</p>
            </div>

            <div class="image-area">
                <img src="${cardData.image}">
            </div>

            <div class="content">
                <h3>${cardData.role}</h3>
            </div>
        </div>
    `;

  wrapper.addEventListener("click", () => {
    window.location.href = `../view/view.html?id=${cardData.id}`;
  });

  return wrapper;
}

function applyFilters() {
  const t = document.getElementById("filterTemplate").value;
  const r = document.getElementById("filterRarity").value;
  const g = document.getElementById("filterGender").value;
  const s = document.getElementById("filterSeries").value.toLowerCase();

  const filtered = allCards.filter((card) => {
    const matchTemplate = t === "all" || card.templateId === t;
    const matchRarity = r === "all" || card.rarity === r;
    const matchGender =
      g === "all" || (card.gender || "").toLowerCase() === g.toLowerCase();
    const matchSeries = !s || card.series?.toLowerCase().includes(s);

    return matchTemplate && matchRarity && matchGender && matchSeries;
  });

  renderGallery(filtered);
}

document
  .getElementById("filterTemplate")
  .addEventListener("change", applyFilters);
document
  .getElementById("filterRarity")
  .addEventListener("change", applyFilters);

document.getElementById("filterSeries").addEventListener("input", applyFilters);
document
  .getElementById("filterGender")
  .addEventListener("change", applyFilters);

function populateFilters(cards) {
  const select = document.getElementById("filterTemplate");

  const uniqueTemplates = [...new Set(cards.map((c) => c.templateId))];

  uniqueTemplates.forEach((id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = id;
    select.appendChild(opt);
  });
}

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "../../index.html";
});

async function exportCards() {
  const db = await openDB();

  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);

  const req = store.getAll();

  req.onsuccess = () => {
    const data = JSON.stringify(req.result, null, 2);

    const blob = new Blob([data], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export.cardcraft";
    a.click();

    URL.revokeObjectURL(url);

    NotificationModule.notify("Sucess", "Export Completed!!")
  };
}

document.getElementById("exportBtn").addEventListener("click", exportCards);

document.getElementById("importFile").addEventListener("change", importCards);

async function importCards(e) {
  const file = e.target.files[0];

  // 1. Verify file extension
  if (!file.name.endsWith(".cardcraft")) {
    ModalModule.open(
      "Import Failed",
      `<div style="font-family: monospace; color: #ff4a4a; font-size: 13px;">
        ❌ Invalid file format! Please upload a file with the <strong>.cardcraft</strong> extension.
       </div>`,
    );
    e.target.value = "";
    return;
  }

  if (!file) return;

  const text = await file.text();

  // const cards = JSON.parse(text);
  let cards;
  try {
    cards = JSON.parse(text);
  } catch (error) {
    NotificationModule.notify("Error", error.message, { type: "error" });
  }

  if (!Array.isArray(cards)) {
    cards = cards.card ? [cards.card] : [cards];
  }

  // 2. Verify internal card data structure
  const isValidStructure =
    cards.length > 0 &&
    cards.every(
      (card) =>
        card &&
        card.name !== undefined &&
        card.series !== undefined &&
        card.role !== undefined,
    );

  if (!isValidStructure || cards.length === 0) {
    ModalModule.open(
      "Import Failed",
      `<div style="font-family: monospace; color: #ff4a4a; font-size: 13px;">
        ❌ Validation failed! The .cardcraft file does not contain valid card data.
       </div>`,
    );
    e.target.value = "";
    return;
  }

  const db = await openDB();

  // Get existing cards
  const existingCards = await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  const existingSet = new Set(
    existingCards.map(
      (card) =>
        `${(card.name || "").trim().toLowerCase()}|` +
        `${(card.series || "").trim().toLowerCase()}|` +
        `${(card.role || "").trim().toLowerCase()}`,
    ),
  );

  const skippedCards = [];

  const cardsToImport = cards.filter((card) => {
    const key =
      `${(card.name || "").trim().toLowerCase()}|` +
      `${(card.series || "").trim().toLowerCase()}|` +
      `${(card.role || "").trim().toLowerCase()}`;

    if (existingSet.has(key)) {
      skippedCards.push(`${card.name} (${card.series} - ${card.role})`);
      return false;
    }

    existingSet.add(key); // prevents duplicates inside import file too
    return true;
  });

  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);

  cardsToImport.forEach((card) => {
    store.put(card);
  });

  tx.oncomplete = () => {
    const totalSkipped = skippedCards.length;

    const message = `
      <div style="
        font-family: monospace;
        color: #e5e5e5;
        line-height: 1.5;
      ">

        <!-- STATUS -->
        <div style="
          font-size: 14px;
          font-weight: 700;
          color: #00ffc3;
          margin-bottom: 10px;
        ">
          ✔ Cards imported successfully!
        </div>

        <!-- SKIPPED STATE -->
        ${
          totalSkipped > 0
            ? `
          <div style="
            font-size: 13px;
            font-weight: 700;
            color: #ffcc00;
            margin-bottom: 6px;
          ">
            ⚠ Duplicate cards not added (${totalSkipped})
          </div>

          <div style="
            max-height: 180px;
            overflow-y: auto;
            padding: 8px;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            background: rgba(0,0,0,0.2);
            font-size: 12px;
          ">
            ${skippedCards
              .map(
                (item) => `
                <div style="
                  padding: 4px 0;
                  border-bottom: 1px solid rgba(255,255,255,0.05);
                ">
                  ${item}
                </div>
              `,
              )
              .join("")}
          </div>
          `
            : `
          <div style="
            font-size: 13px;
            color: #aaa;
          ">
            No duplicates found 🎉
          </div>
          `
        }

      </div>
    `;

    ModalModule.open("Import Complete", message);

    loadGallery();
  };
}

async function deleteCard(cardId, buttonElement) {
  // Ask the user for confirmation before performing a destructive action
  const confirmed = await ModalModule.open(
    "Delete Card?",
    "Are you sure you want to permanently delete this card? This action cannot be undone.",
    {
      confirmText: "Delete",
      cancelText: "Keep",
      isDestructive: true,
    },
  );

  // Exit early if the user decides not to delete the card
  if (confirmed) {
    try {
      // Connect to the IndexedDB database
      const db = await openDB();

      // Start a write transaction so the card can be removed
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);

      console.log("Deleting:", cardId, typeof cardId);

      // Delete the card using its unique ID
      store.delete(+cardId);

      // Only update the UI after IndexedDB confirms the operation completed
      tx.oncomplete = () => {
        // Remove the card element from the gallery
        buttonElement.parentElement.remove();

        // Notify the user that the deletion succeeded
        NotificationModule.notify("Deleted", "Card removed from workspace.", {
          type: "danger",
        });

        // Remove the deleted card from the in-memory cache
        allCards = allCards.filter((card) => card.id !== cardId);
      };

      // Handle IndexedDB transaction failures
      tx.onerror = () => {
        console.error("Failed to delete card:", tx.error);

        NotificationModule.notify("Error", "Failed to delete card.", {
          type: "danger",
        });
      };
    } catch (err) {
      // Handle unexpected errors such as database connection issues
      console.error(err);

      NotificationModule.notify("Error", "Failed to delete card.", {
        type: "danger",
      });
    }
  }
}
