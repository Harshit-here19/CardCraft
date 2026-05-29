const dbName = "CardCraftDB";

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

        const template = templates.find(t => t.id === card.templateId);

        const gradient = template?.background || "linear-gradient(135deg,#111,#222)";
        const textColor = template?.textColor || "#fff";
        const font = card?.font || template?.font || "Poppins";
        const shadow = template?.cardShadow || "none";

        document.getElementById("viewRoot").innerHTML = `
        <div class="view-card"
            style="
                background:${gradient};
                color:${textColor};
                font-family:${font};
                box-shadow:${shadow};
            ">

            <img src="${card.image}" class="view-img"/>

            <div class="badge">${card.rarity || "Common"}</div>

            <h1>${card.name}</h1>
            <p>${card.series}</p>

            <div class="meta">
                <p><b>Role:</b> ${card.role || "-"}</p>
                <p><b>Species:</b> ${card.species || "-"}</p>
                <p><b>Gender:</b> ${card.gender || "-"}</p>
            </div>

            <div class="desc">
                ${card.desc || ""}
            </div>

            <div class="abilities">
                ${card.abilities || ""}
            </div>

        </div>
    `;
    };
}

loadView();

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "gallery.html";
});