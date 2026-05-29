const dbName = "CardCraftDB";
const storeName = "cards";

// In Deployement Enables this 
let templates = [];

// let templates = [
//     {
//         "id": "cyber",
//         "name": "Cyber Neon",
//         "background": "linear-gradient(135deg, #ff512f, #dd2476)",
//         "textColor": "#ffffff",
//         "borderColor": "#00f5ff",
//         "font": "Poppins",
//         "cardShadow": "0 0 30px rgba(0,245,255,0.4)",
//         "rarityGlow": "0 0 20px rgba(255,255,255,0.3)"
//     },
//     {
//         "id": "dark_neon",
//         "name": "Dark Neon",
//         "background": "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
//         "textColor": "#ffffff",
//         "borderColor": "#8a2be2",
//         "font": "Orbitron",
//         "cardShadow": "0 0 40px rgba(138,43,226,0.5)",
//         "rarityGlow": "0 0 25px rgba(138,43,226,0.4)"
//     },
//     {
//         "id": "royal_gold",
//         "name": "Royal Gold",
//         "background": "linear-gradient(135deg, #f7971e, #ffd200)",
//         "textColor": "#1a1a1a",
//         "borderColor": "#b8860b",
//         "font": "Cinzel",
//         "cardShadow": "0 0 25px rgba(255,215,0,0.5)",
//         "rarityGlow": "0 0 20px rgba(255,215,0,0.4)"
//     },
//     {
//         "id": "ice_frost",
//         "name": "Ice Frost",
//         "background": "linear-gradient(135deg, #e0f7ff, #a6d8ff)",
//         "textColor": "#0a1a2f",
//         "borderColor": "#00bfff",
//         "font": "Poppins",
//         "cardShadow": "0 0 25px rgba(0,191,255,0.4)",
//         "rarityGlow": "0 0 20px rgba(0,191,255,0.3)"
//     },
//     {
//         "id": "shadow_flame",
//         "name": "Shadow Flame",
//         "background": "linear-gradient(135deg, #2c3e50, #e74c3c)",
//         "textColor": "#ffffff",
//         "borderColor": "#ff4500",
//         "font": "Orbitron",
//         "cardShadow": "0 0 30px rgba(255,69,0,0.4)",
//         "rarityGlow": "0 0 25px rgba(231,76,60,0.4)"
//     },
//     /* ========================================= */
//     /* NEW ADDITIONS */
//     /* ========================================= */
//     {
//         "id": "ios_glass",
//         "name": "iOS Minimal Glass",
//         "background": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
//         "textColor": "#ffffff",
//         "borderColor": "rgba(255, 255, 255, 0.3)",
//         "font": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
//         "cardShadow": "0 20px 50px rgba(0,0,0,0.3)",
//         "rarityGlow": "0 0 15px rgba(255,255,255,0.2)"
//     },
//     {
//         "id": "cosmic_void",
//         "name": "Cosmic Void",
//         "background": "linear-gradient(135deg, #020024, #090979, #00d4ff)",
//         "textColor": "#ffffff",
//         "borderColor": "#00d4ff",
//         "font": "Rajdhani",
//         "cardShadow": "0 0 35px rgba(0,212,255,0.4)",
//         "rarityGlow": "0 0 20px rgba(9,9,121,0.6)"
//     },
//     {
//         "id": "emerald_mythic",
//         "name": "Emerald Mythic",
//         "background": "linear-gradient(135deg, #0575e6, #00f260)",
//         "textColor": "#ffffff",
//         "borderColor": "#00ff87",
//         "font": "Cinzel Decorative",
//         "cardShadow": "0 0 30px rgba(0,242,96,0.4)",
//         "rarityGlow": "0 0 25px rgba(255,255,255,0.3)"
//     },
//     {
//         "id": "retro_arcade",
//         "name": "8-Bit Retro",
//         "background": "linear-gradient(135deg, #f107a3, #7b2ff7)",
//         "textColor": "#ffffff",
//         "borderColor": "#39ff14",
//         "font": "Press Start 2P",
//         "cardShadow": "0 0 25px rgba(57,255,20,0.4)",
//         "rarityGlow": "0 0 15px rgba(241,7,163,0.5)"
//     },
//     {
//         "id": "vampire_lord",
//         "name": "Crimson Vampire",
//         "background": "linear-gradient(135deg, #140000, #4a0000, #ff0055)",
//         "textColor": "#ffffff",
//         "borderColor": "#ff0055",
//         "font": "Playfair Display",
//         "cardShadow": "0 0 35px rgba(255,0,85,0.5)",
//         "rarityGlow": "0 0 20px rgba(0,0,0,0.8)"
//     }
// ];

fetch("templates.json")
    .then(res => res.json())
    .then(data => {
        templates = data.templates;
        loadTemplateOptions();
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