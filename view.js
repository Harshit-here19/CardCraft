const dbName = "CardCraftDB";

let templates = [];
let currentCard = null;

fetch("templates.json")
    .then(res => res.json())
    .then(data => {
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
        card: currentCard
    };

    const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    const safeName = currentCard.name
        .replace(/[^a-z0-9]/gi, "_");

    a.download = `${safeName}.cardcraft`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
}

document.getElementById("exportBtn")
    .addEventListener(
        "click",
        exportCurrentCard
    );