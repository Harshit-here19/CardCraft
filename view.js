const dbName = "CardCraftDB";

let templates = [];
let currentCard = null;

fetch("templates.json")
  .then((res) => res.json())
  .then((data) => {
    templates = data.templates;
  });

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getId() {
  return new URLSearchParams(window.location.search).get("id");
}

async function loadView() {
  const id = Number(getId());

  const db = await openDB();
  const tx = db.transaction("cards", "readonly");
  const store = tx.objectStore("cards");

  const req = store.get(id);

  req.onsuccess = () => {
    const card = req.result;
    if (!card) return;

    currentCard = card;

    const template = templates.find((t) => t.id === card.templateId);

    const gradient = card?.backgroundImage
      ? `url(${card.backgroundImage}) center/cover no-repeat`
      : card?.colors?.color1
        ? `linear-gradient(135deg, ${card.colors.color1}, ${card?.colors?.color2 || card.colors.color1})`
        : template?.background || "linear-gradient(135deg, #111, #222)";
    const textColor = card?.colors.textColor || template?.textColor || "#fff";
    const font = card?.font || template?.font || "Poppins";
    const shadow = template?.cardShadow || "none";

    console.log(card);

    document.getElementById("viewRoot").innerHTML = `
        
        <div class="view-card" id="view-card"
            style="
                background:${gradient};
                color:${textColor};
                font-family:${font};
                box-shadow:${shadow};
            ">
            <div class="shine"></div>

            <img src="${card.image}" class="view-img"/>

            <div class="badge">${card.rarity || "Common"}</div>

            <h1 id="name">${card.name}</h1>
            <p>${card.series}</p>

            <div class="meta">
                <p><b>Role:</b> ${card.role || "-"}</p>
                <p><b>Species:</b> ${card.species || "-"}</p>
                <p><b>Gender:</b> ${card.gender || "-"}</p>
            </div>

            <div class="desc">
                ${card.desc || ""}
            </div>

        </div>
    `;
  };
}

loadView();

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "gallery.html";
});

function exportCurrentCard() {
  if (!currentCard) {
    alert("Card not loaded yet.");
    return;
  }

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    card: currentCard,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  const safeName = currentCard.name.replace(/[^a-z0-9]/gi, "_");

  a.download = `${safeName}.cardcraft`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

document
  .getElementById("exportBtn")
  .addEventListener("click", exportCurrentCard);

function prepareExport() {
  const shine = document.querySelector(".shine");
  if (shine) shine.style.display = "none";

  document.querySelectorAll(".meta p, .badge").forEach(el => {
    el.dataset.backdrop = el.style.backdropFilter;
    el.style.backdropFilter = "none";
    el.style.webkitBackdropFilter = "none";

    el.style.background = "rgba(0,0,0,0.4)";
  });
}

function restoreAfterExport() {
  const shine = document.querySelector(".shine");
  if (shine) shine.style.display = "";

  document.querySelectorAll(".meta p, .badge").forEach(el => {
    el.style.backdropFilter = "";
    el.style.webkitBackdropFilter = "";
    el.style.background = "";
  });
}

/* ========================= */
/* EXPORT PNG */
/* ========================= */

document.getElementById("saveImage").addEventListener("click", async () => {
  const originalCard = document.getElementById("view-card");

  if (!originalCard) return;

  // Create export clone
  const clone = originalCard.cloneNode(true);

  clone.id = "export-card";
  clone.classList.add("exporting");

  // Position off-screen
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.animation = "none";

  document.body.appendChild(clone);

  try {
    // Remove shine from clone
    const shine = clone.querySelector(".shine");
    if (shine) {
      shine.remove();
    }

    // Remove problematic backdrop filters
    clone.querySelectorAll("*").forEach((el) => {
      el.style.backdropFilter = "none";
      el.style.webkitBackdropFilter = "none";
    });

    // Make glass panels export-friendly
    clone.querySelectorAll(".meta p").forEach((el) => {
      el.style.background = "rgba(255,255,255,0.12)";
    });

    clone.querySelectorAll(".badge").forEach((el) => {
      el.style.background = "rgba(255,255,255,0.15)";
    });

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    const link = document.createElement("a");

    const name =
      document.getElementById("name")?.innerText.trim() || "anime-card";

    link.download = `${name}-front.png`;
    link.href = canvas.toDataURL("image/png");

    link.click();
  } catch (err) {
    console.error(err);
  } finally {
    clone.remove();
  }
});
