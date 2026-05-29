const dbName = "CardCraftDB";
const storeName = "cards";

// In Deployement Enables this 
let templates = [];

fetch("templates.json")
    .then(res => res.json())
    .then(data => {
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

    cards.forEach(card => {
        gallery.appendChild(renderCard(card));
    });
}

function renderCard(cardData) {

    const template = templates.find(t => t.id === cardData.templateId);

    const wrapper = document.createElement("div");
    wrapper.className = "gallery-card-wrapper";

    wrapper.dataset.template = cardData.templateId;
    wrapper.dataset.rarity = cardData.rarity;
    wrapper.dataset.series = cardData.series;

    wrapper.innerHTML = `
        <div class="anime-card mini-card" style="
            background:${template?.background};
            color:${template?.textColor};
            border-color:${template?.borderColor};
            font-family:${template?.font};
            box-shadow:${template?.cardShadow};
        ">
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
                <p>${cardData.desc}</p>
            </div>
        </div>
    `;

    wrapper.addEventListener("click", () => {
        window.location.href = `view.html?id=${cardData.id}`;
    });

    return wrapper;
}

function applyFilters() {

    const t = document.getElementById("filterTemplate").value;
    const r = document.getElementById("filterRarity").value;
    const s = document.getElementById("filterSeries").value.toLowerCase();

    const filtered = allCards.filter(card => {

        const matchTemplate = (t === "all" || card.templateId === t);
        const matchRarity = (r === "all" || card.rarity === r);
        const matchSeries = (!s || card.series?.toLowerCase().includes(s));

        return matchTemplate && matchRarity && matchSeries;
    });

    renderGallery(filtered);
}

document.getElementById("filterTemplate").addEventListener("change", applyFilters);
document.getElementById("filterRarity").addEventListener("change", applyFilters);
document.getElementById("filterSeries").addEventListener("input", applyFilters);

function populateFilters(cards) {

    const select = document.getElementById("filterTemplate");

    const uniqueTemplates = [...new Set(cards.map(c => c.templateId))];

    uniqueTemplates.forEach(id => {
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = id;
        select.appendChild(opt);
    });
}
