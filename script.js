/* ========================= */
/* script.js */
/* ========================= */

const card = document.getElementById("card");
const cardBack = document.getElementById("cardBack");
const cardInner = document.getElementById("cardInner");
const container = document.getElementById("cardContainer");

const dbName = "CardCraftDB";
const storeName = "cards";
const packStore = "packs";

let editingCardId = null;

const params = new URLSearchParams(window.location.search);

editingCardId = params.get("edit");

if (editingCardId) {
  loadCardForEditing(+editingCardId);
}

if (editingCardId) {
    document.getElementById("saveLocal").innerText =
        "Update";
}

async function loadCardForEditing(cardId) {
  const db = await openDB();

  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);

  const request = store.get(cardId);

  request.onsuccess = () => {
    const data = request.result;

    if (!data) return;

    populateEditor(data);
  };
}

// In Deployement Enables this
let templates = [];
let backgroundImage = null;

fetch("templates.json")
  .then((res) => res.json())
  .then((data) => {
    templates = data.templates;
    loadTemplateOptions();
  });

function loadTemplateOptions() {
  const select = document.getElementById("templateSelect");

  templates.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.id;
    option.textContent = t.name;
    select.appendChild(option);
  });
}

loadTemplateOptions();

/* ========================= */
/* FIELD MAPPING */
/* ========================= */

const fields = {
  name: "cardName",
  series: "cardSeries",
  role: "cardRole",
  desc: "cardDesc",
  rarity: "cardRarity",
  species: "cardSpecies",
  gender: "cardGender",
  abilities: "cardAbilities",
};

/* ========================= */
/* AUTO UPDATE */
/* ========================= */

Object.keys(fields).forEach((id) => {
  const input = document.getElementById(id);

  if (!input) return;

  input.addEventListener("input", () => {
    const target = document.getElementById(fields[id]);

    const value = input.value.trim();

    /* ========================= */
    /* EMPTY FIELD = HIDE */
    /* ========================= */

    if (value === "") {
      target.style.display = "none";
    } else {
      target.style.display = "block";

      target.innerText = value;
    }

    /* ========================= */
    /* BACK SIDE NAME */
    /* ========================= */

    if (id === "name") {
      document.getElementById("backName").innerText = value || "Character Name";
    }
  });
});

/* ========================= */
/* IMAGE UPLOAD */
/* ========================= */

document.getElementById("upload").addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      document.getElementById("cardImage").src = e.target.result;

      document.getElementById("dropArea").classList.add("has-image");
    };

    reader.readAsDataURL(file);
  }
});

/* ========================= */
/* IMAGE URL */
/* ========================= */

document.getElementById("imageUrl").addEventListener("input", async (e) => {
  const url = e.target.value.trim();
  if (!url) return;

  // convert URL → base64
  const res = await fetch(url);
  const blob = await res.blob();

  const reader = new FileReader();
  reader.onloadend = () => {
    document.getElementById("cardImage").src = reader.result;
    document.getElementById("dropArea").classList.add("has-image");
  };
  reader.readAsDataURL(blob);
});
/* ========================= */
/* DRAG & DROP */
/* ========================= */

const dropArea = document.getElementById("dropArea");

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();

  dropArea.style.border = "3px dashed white";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.style.border = "3px solid rgba(255,255,255,0.2)";
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();

  dropArea.style.border = "3px solid rgba(255,255,255,0.2)";

  const file = e.dataTransfer.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (ev) => {
      document.getElementById("cardImage").src = ev.target.result;

      document.getElementById("dropArea").classList.add("has-image");
    };

    reader.readAsDataURL(file);
  }
});

/* ========================= */
/* COLORS */
/* ========================= */

function getGradientStrings() {
  const dropZone = document.getElementById("backgroundDropZone");

  // 1. Select all the color row containers in order
  const colorRows = dropZone.querySelectorAll(".colorRow");

  // 2. Map through the rows to extract and pair the hex code and percentage span value
  const colorValues = Array.from(colorRows).map((row) => {
    const input = row.querySelector('input[type="color"]');
    const span = row.querySelector("span");

    const hex = input ? input.value : "#000000";
    // Get the percentage text. If the span has just "50", we append "%".
    let percent = span ? span.textContent.trim() : "0";
    if (!percent.includes("%")) {
      percent += "%";
    }

    // Combines them into format: "#DC143C 0%"
    return `${hex} ${percent}`;
  });

  // Edge case: If there are no colors at all
  if (colorValues.length === 0) {
    return { c1: "", c2: "" };
  }

  // Edge case: If there's only 1 color, it acts as the last one
  if (colorValues.length === 1) {
    return {
      c1: "",
      c2: colorValues[0],
    };
  }

  // 3. Separate the last color from the rest
  const lastColor = colorValues[colorValues.length - 1]; // Hex code of the last gradient
  const trackingColors = colorValues.slice(0, -1); // Array of all gradients except the last one

  // 4. Assign to variables according to your rules
  const c1 = trackingColors.join(","); // Comma-separated string (e.g., "hex1,hex2,hex3")
  const c2 = lastColor; // Single hex string (e.g., "hex4")

  return { c1, c2 };
}

function updateColors() {
  // Call our helper function to extract c1 and c2 strings
  const { c1, c2 } = getGradientStrings();

  const gradient = `linear-gradient(135deg, ${c1}, ${c2})`;

  if (backgroundImage) {
    card.style.backgroundImage = `url(${backgroundImage})`;
    cardBack.style.backgroundImage = `url(${backgroundImage})`;

    card.style.backgroundSize = "cover";
    cardBack.style.backgroundSize = "cover";

    card.style.backgroundPosition = "center";
    cardBack.style.backgroundPosition = "center";
  } else {
    card.style.background = gradient;
    cardBack.style.background = gradient;
  }
}

document.getElementById("color1").addEventListener("input", updateColors);

document.getElementById("color2").addEventListener("input", updateColors);

/* ========================= */
/* TEXT COLOR */
/* ========================= */

document.getElementById("textColor").addEventListener("input", (e) => {
  const color = e.target.value;

  card.style.color = color;

  cardBack.style.color = color;
});

/* ========================= */
/* BORDER COLOR */
/* ========================= */

document.getElementById("borderColor").addEventListener("input", (e) => {
  const color = e.target.value;

  card.style.borderColor = color;

  cardBack.style.borderColor = color;
});

/* ========================= */
/* FONT */
/* ========================= */

document.getElementById("fontSelect").addEventListener("change", (e) => {
  const font = e.target.value;

  card.style.fontFamily = font;

  cardBack.style.fontFamily = font;
});

/* ========================= */
/* TEMPLATE */
/* ========================= */

document.getElementById("templateSelect").addEventListener("change", (e) => {
  const selected = templates.find((t) => t.id === e.target.value);
  if (!selected) return;

  const card = document.getElementById("card");
  const cardBack = document.getElementById("cardBack");

  // Apply styles to front
  card.style.background = selected.background;
  card.style.color = selected.textColor;
  card.style.borderColor = selected.borderColor;
  card.style.fontFamily = selected.font;
  card.style.boxShadow = selected.cardShadow;

  // Apply styles to back
  cardBack.style.background = selected.background;
  cardBack.style.color = selected.textColor;
  cardBack.style.borderColor = selected.borderColor;
  cardBack.style.fontFamily = selected.font;
  cardBack.style.boxShadow = selected.cardShadow;

  // Optional: update rarity glow
  const rarity = document.getElementById("cardRarity");
  rarity.style.textShadow = selected.rarityGlow || "none";
});

/* ========================= */
/* CARD FLIP */
/* ========================= */

document.getElementById("flipCard").addEventListener("click", () => {
  cardInner.style.transition = "transform 0.35s ease";
  cardInner.classList.toggle("flipped");
});

function prepareExport() {
  const inner = document.getElementById("cardInner");
  const shine = document.getElementsByClassName("shine")[0];

  // remove flip + 3D transforms temporarily
  inner.classList.remove("flipped");

  if (shine) {
    shine.style.display = "none"; // Completely hide it from the DOM renderer
  }

  inner.style.transform = "none";
}

function restoreAfterExport() {
  const inner = document.getElementById("cardInner");
  const shine = document.getElementsByClassName("shine")[0];

  inner.style.transform = "";

  if (shine) {
    shine.style.display = ""; // Restores it back to block/flex/absolute automatically
  }
}

/* ========================= */
/* EXPORT PNG */
/* ========================= */

document.getElementById("saveImage").addEventListener("click", async () => {
  prepareExport();

  // Give the browser one frame to hide the shine and reset transforms
  requestAnimationFrame(async () => {
    try {
      const canvas = await html2canvas(
        document.getElementById("cardFront") || document.getElementById("card"),
        {
          scale: 2,
          useCORS: true,
          // allowTaint: false, // Strict CORS enforcement
          backgroundColor: null,
        },
      );

      const link = document.createElement("a");
      const name = document.getElementById("name").value.trim() || "anime-card";

      link.download = `${name}-front.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      NotificationModule.notify("Error!", "Export Failed", {
        type: "danger",
      });
    } finally {
      // Always restore the card state, even if it fails
      restoreAfterExport();
    }
  });
});

/* ========================= */
/* EXPORT PDF */
/* ========================= */

document.getElementById("savePDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const name = document.getElementById("name").value.trim() || "anime-card";

  const body = document.body;

  // 🔥 ENTER SAFE MODE (THIS IS THE KEY FIX)
  body.classList.add("export-mode");

  const cardFront = document.getElementById("card");
  const cardBack = document.getElementById("cardBack");

  // backup original visibility
  const frontDisplay = cardFront.style.display;
  const backDisplay = cardBack.style.display;

  /* ================= FRONT ================= */

  cardFront.style.display = "block";
  cardBack.style.display = "none";

  await new Promise((r) => setTimeout(r, 150));

  const frontCanvas = await html2canvas(cardFront, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  });

  pdf.addImage(frontCanvas.toDataURL("image/png"), "PNG", 15, 15, 180, 260);

  pdf.addPage();

  /* ================= BACK ================= */

  cardFront.style.display = "none";
  cardBack.style.display = "block";

  await new Promise((r) => setTimeout(r, 150));

  const backCanvas = await html2canvas(cardBack, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  });

  pdf.addImage(backCanvas.toDataURL("image/png"), "PNG", 15, 15, 180, 260);

  /* ================= RESTORE ================= */

  cardFront.style.display = frontDisplay;
  cardBack.style.display = backDisplay;

  body.classList.remove("export-mode");

  pdf.save(`${name}.pdf`);
});

/* ========================= */
/* INITIAL HIDE EMPTY FIELDS */
/* ========================= */

Object.keys(fields).forEach((id) => {
  const target = document.getElementById(fields[id]);

  if (target) {
    target.style.display = "none";
  }
});

/* ========================= */
/* DEFAULT CARD NAME */
/* ========================= */

document.getElementById("cardName").style.display = "block";

document.getElementById("backName").style.display = "block";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then((reg) => {
      // Check if there is an update found
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        if (installingWorker == null) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New content is available; force reload to see changes
              NotificationModule.notify(
                "NEW!!",
                "New content available! Reloading...",
              );
              window.location.reload();
            }
          }
        };
      };
    })
    .catch((err) => console.error("Service Worker registration failed:", err));
}

function getCardState() {
  return {
    name: document.getElementById("name").value,
    series: document.getElementById("series").value,
    role: document.getElementById("role").value,
    desc: document.getElementById("desc").value,
    species: document.getElementById("species").value,
    gender: document.getElementById("gender").value,
    abilities: document.getElementById("abilities").value,

    rarity: document.getElementById("rarity").value,

    image: document.getElementById("cardImage").src,

    backgroundImage: backgroundImage,
    // IMPORTANT: styles
    colors: {
      color1:
        document.getElementById("color1").value !== "#DC143C"
          ? document.getElementById("color1").value
          : "",
      color2:
        document.getElementById("color2").value !== "#8B0000"
          ? document.getElementById("color2").value
          : "",
      textColor:
        document.getElementById("textColor").value !== "#ffffff"
          ? document.getElementById("textColor").value
          : "",
      borderColor: document.getElementById("borderColor").value,
    },

    font: document.getElementById("fontSelect").value,
    templateId: document.getElementById("templateSelect").value,
  };
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(packStore)) {
        db.createObjectStore(packStore, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => reject(request.error);
  });
}

document.getElementById("saveLocal").addEventListener("click", async () => {
  const db = await openDB();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);

  const { c1, c2 } = getGradientStrings();

  const cardData = {
    id: editingCardId ? Number(editingCardId) : Date.now(),

    ...getCardState(),
  };

  // 3. Update the inner colors object properties with your newly generated strings
  cardData.colors.color1 = c1;
  cardData.colors.color2 = c2;

  store.put(cardData);

  // alert("Card Saved Offline!");
  NotificationModule.notify("Success", "Card Saved Offline!", {
    type: "success",
    duration: 3000,
  });
});

document.getElementById("loadCards").addEventListener("click", async () => {
  const db = await openDB();

  const tx = db.transaction(storeName, "readonly");

  const store = tx.objectStore(storeName);

  const request = store.getAll();

  request.onsuccess = () => {
    // console.log(request.result);
    window.location.href = "./components/gallery/gallery.html";
  };
});

function populateEditor(data) {
  backgroundImage = data.backgroundImage || null;

  document.getElementById("name").value = data.name || "";
  document.getElementById("series").value = data.series || "";
  document.getElementById("role").value = data.role || "";
  document.getElementById("desc").value = data.desc || "";
  document.getElementById("species").value = data.species || "";
  document.getElementById("gender").value = data.gender || "";
  document.getElementById("abilities").value = data.abilities || "";

  document.getElementById("rarity").value = data.rarity || "Common";

  document.getElementById("cardImage").src = data.image;

  document.getElementById("color1").value = data.colors?.color1 || "#009bc2";

  document.getElementById("color2").value = data.colors?.color2 || "#128779";

  document.getElementById("textColor").value =
    data.colors?.textColor || "#ffffff";

  document.getElementById("borderColor").value =
    data.colors?.borderColor || "#ffffff";

  document.getElementById("fontSelect").value = data.font;
  document.getElementById("templateSelect").value = data.templateId;

  // Trigger existing update handlers

  Object.keys(fields).forEach((id) => {
    document.getElementById(id)?.dispatchEvent(new Event("input"));
  });

  updateColors();

  document.getElementById("fontSelect").dispatchEvent(new Event("change"));

  document.getElementById("templateSelect").dispatchEvent(new Event("change"));
}

async function loadGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const db = await openDB();
  const tx = db.transaction("cards", "readonly");
  const store = tx.objectStore("cards");

  const req = store.getAll();

  req.onsuccess = () => {
    req.result.forEach((card) => {
      const div = document.createElement("div");

      div.innerHTML = `
                <div class="card-item">
                    <img src="${card.image}" width="120"/>
                    <h3>${card.name}</h3>
                </div>
            `;

      gallery.appendChild(div);
    });
  };
}

let currentSlide = 0;
const totalSlides = 2;
let autoCycle = setInterval(nextSlide, 5000);

function switchSlide(index) {
  clearInterval(autoCycle);
  autoCycle = setInterval(nextSlide, 5000);

  currentSlide = index;
  updateUI();
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateUI();
}

function updateUI() {
  // Target both slide elements directly by index
  for (let i = 0; i < totalSlides; i++) {
    const slide = document.getElementById(`slide-${i}`);
    const dot = document.querySelectorAll(".dot")[i];

    if (i === currentSlide) {
      slide.classList.add("active");
      dot.classList.add("active");
    } else {
      slide.classList.remove("active");
      dot.classList.remove("active");
    }
  }
}

const mainGroup = document.querySelector(".profileFormGroup");
const extraFields = document.getElementById("extraFields");

function expandForm() {
  extraFields.classList.add("expanded");
}

// Closes the popup safely if you tap or click outside the component boundaries
document.addEventListener("click", function (event) {
  const isClickInside = mainGroup.contains(event.target);

  if (!isClickInside) {
    extraFields.classList.remove("expanded");
  }
});

// Floating Buttons

const floatingMenu = document.getElementById("floatingMenu");
const masterBtn = document.getElementById("masterBtn");

// Toggle open/close state on click
masterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  floatingMenu.classList.toggle("active");
});

// Close smoothly if the user clicks anywhere else on the screen
document.addEventListener("click", (e) => {
  if (!floatingMenu.contains(e.target)) {
    floatingMenu.classList.remove("active");
  }
});

// Close menu upon selecting an option
document.querySelectorAll(".menu-item").forEach((button) => {
  button.addEventListener("click", () => {
    floatingMenu.classList.remove("active");
  });
});

// Gradient Image upload Logic

const backgroundDropZone = document.getElementById("backgroundDropZone");

backgroundDropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

backgroundDropZone.addEventListener("drop", (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    backgroundImage = ev.target.result;

    updateColors();
  };

  reader.readAsDataURL(file);
});

function makeSpanNumericOnly(span) {
  // 1. Block non-numeric keystrokes
  span.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      span.blur(); // Unfocuses the span instead of making a new line
      return;
    }

    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];
    if (allowedKeys.includes(event.key)) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault(); // Stop the key from being typed
    }
  });

  // 2. Prevent pasting non-numeric text
  span.addEventListener("paste", (event) => {
    event.preventDefault();
    const pasteData = (event.clipboardData || window.clipboardData).getData(
      "text",
    );
    const cleanedData = pasteData.replace(/[^0-9]/g, "");
    document.execCommand("insertText", false, cleanedData);
  });

  // 👇 NEW: Trigger background updates when the user types a custom percentage 👇
  span.addEventListener("input", () => {
    span.dataset.edited = "true"; // Mark as custom edited
    updateColors(); // Automatically recalculate and apply the gradient background!
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("backgroundDropZone");
  const plusButton = dropZone.querySelector(".colorDesc");

  // 👇 ADD THIS LOOP HERE: Hooks up your pre-existing HTML spans on startup 👇
  const existingSpans = dropZone.querySelectorAll(".percent-span");
  existingSpans.forEach((span) => {
    makeSpanNumericOnly(span);
  });

  // Counter to give each new gradient input a unique ID and label
  let gradientCount = 2;

  plusButton.addEventListener("click", () => {
    gradientCount++;

    // 1. Create the new row container
    const newRow = document.createElement("div");
    newRow.className = "colorRow";

    // 2. Define the internal HTML for the new row
    newRow.innerHTML = `
            <label class="colorLabel" for="color${gradientCount}">Gradient ${gradientCount}</label>
            <span contenteditable="true" class="percent-span">0</span>
            <input type="color" id="color${gradientCount}" value="#666666">
        `;

    // 3. Insert the new row just before the .colorDesc section
    dropZone.insertBefore(newRow, plusButton);

    // 3.5 Listen for manual user edits on the new span
    const newSpan = newRow.querySelector(".percent-span");
    const newInput = newRow.querySelector('input[type="color"]');

    // Apply the numeric-only lock
    makeSpanNumericOnly(newSpan);

    if (newInput) {
      newInput.addEventListener("input", updateColors); // Connects the color slider for new boxes
    }

    newSpan.addEventListener("input", () => {
      newSpan.dataset.edited = "true";
    });

    // 4. Select all color rows now present in the DOM
    const allRows = dropZone.querySelectorAll(".colorRow");
    const totalRows = allRows.length;

    // 5. Loop through them and distribute percentages evenly ONLY if not edited by user
    allRows.forEach((row, index) => {
      const span = row.querySelector(".percent-span");
      if (span && span.dataset.edited !== "true") {
        const percentage =
          totalRows > 1 ? Math.round((index / (totalRows - 1)) * 100) : 0;
        span.textContent = percentage;
      }
    });
  });
});
