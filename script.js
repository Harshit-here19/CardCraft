/* ========================= */
/* script.js */
/* ========================= */

const card = document.getElementById("card");
const cardBack = document.getElementById("cardBack");
const cardInner = document.getElementById("cardInner");
const container = document.getElementById("cardContainer");

// In Deployement Enables this 
let templates = [];

fetch("templates.json")
    .then(res => res.json())
    .then(data => {
        templates = data.templates;
        loadTemplateOptions();
    });

function loadTemplateOptions() {
    const select = document.getElementById("templateSelect");

    templates.forEach(t => {
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
    abilities: "cardAbilities"
};

/* ========================= */
/* AUTO UPDATE */
/* ========================= */

Object.keys(fields).forEach(id => {

    const input = document.getElementById(id);

    if (!input) return;

    input.addEventListener("input", () => {

        const target =
            document.getElementById(fields[id]);

        const value =
            input.value.trim();

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

            document.getElementById("backName")
                .innerText =
                value || "Character Name";

        }

    });

});

/* ========================= */
/* IMAGE UPLOAD */
/* ========================= */

document.getElementById("upload")
    .addEventListener("change", function () {

        const file = this.files[0];

        if (file) {

            const reader = new FileReader();

            reader.onload = e => {

                document.getElementById("cardImage")
                    .src = e.target.result;

            };

            reader.readAsDataURL(file);

        }

    });

/* ========================= */
/* IMAGE URL */
/* ========================= */

document.getElementById("imageUrl")
.addEventListener("input", async (e) => {

    const url = e.target.value.trim();
    if (!url) return;

    // convert URL → base64
    const res = await fetch(url);
    const blob = await res.blob();

    const reader = new FileReader();
    reader.onloadend = () => {
        document.getElementById("cardImage").src = reader.result;
    };
    reader.readAsDataURL(blob);
});
/* ========================= */
/* DRAG & DROP */
/* ========================= */

const dropArea =
    document.getElementById("dropArea");

dropArea.addEventListener("dragover", e => {

    e.preventDefault();

    dropArea.style.border =
        "3px dashed white";

});

dropArea.addEventListener("dragleave", () => {

    dropArea.style.border =
        "3px solid rgba(255,255,255,0.2)";

});

dropArea.addEventListener("drop", e => {

    e.preventDefault();

    dropArea.style.border =
        "3px solid rgba(255,255,255,0.2)";

    const file =
        e.dataTransfer.files[0];

    if (file) {

        const reader =
            new FileReader();

        reader.onload = ev => {

            document.getElementById("cardImage")
                .src = ev.target.result;

        };

        reader.readAsDataURL(file);

    }

});

/* ========================= */
/* COLORS */
/* ========================= */

function updateColors() {

    const c1 =
        document.getElementById("color1").value;

    const c2 =
        document.getElementById("color2").value;

    const gradient =
        `linear-gradient(135deg, ${c1}, ${c2})`;

    card.style.background = gradient;

    cardBack.style.background = gradient;

}

document.getElementById("color1")
    .addEventListener("input", updateColors);

document.getElementById("color2")
    .addEventListener("input", updateColors);

/* ========================= */
/* TEXT COLOR */
/* ========================= */

document.getElementById("textColor")
    .addEventListener("input", e => {

        const color = e.target.value;

        card.style.color = color;

        cardBack.style.color = color;

    });

/* ========================= */
/* BORDER COLOR */
/* ========================= */

document.getElementById("borderColor")
    .addEventListener("input", e => {

        const color = e.target.value;

        card.style.borderColor = color;

        cardBack.style.borderColor = color;

    });

/* ========================= */
/* FONT */
/* ========================= */

document.getElementById("fontSelect")
    .addEventListener("change", e => {

        const font = e.target.value;

        card.style.fontFamily = font;

        cardBack.style.fontFamily = font;

    });

/* ========================= */
/* TEMPLATE */
/* ========================= */

document.getElementById("templateSelect")
    .addEventListener("change", (e) => {

        const selected = templates.find(t => t.id === e.target.value);
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

document.getElementById("flipCard")
    .addEventListener("click", () => {

        cardInner.style.transition = "transform 0.35s ease";
        cardInner.classList.toggle("flipped");

    });

function prepareExport() {

    const inner = document.getElementById("cardInner");

    // remove flip + 3D transforms temporarily
    inner.classList.remove("flipped");

    inner.style.transform = "none";

}

function restoreAfterExport() {

    const inner = document.getElementById("cardInner");

    inner.style.transform = "";

}

/* ========================= */
/* EXPORT PNG */
/* ========================= */

document.getElementById("saveImage")
    .addEventListener("click", async () => {

        prepareExport();

        const canvas = await html2canvas(
            document.getElementById("cardFront") || document.getElementById("card"),
            {
                scale: 2,
                useCORS: true,
                backgroundColor: null
            }
        );

        const link = document.createElement("a");

        const name =
            document.getElementById("name").value.trim() || "anime-card";

        link.download = `${name}-front.png`;
        link.href = canvas.toDataURL("image/png");

        link.click();

        restoreAfterExport();

    });

/* ========================= */
/* EXPORT PDF */
/* ========================= */

document.getElementById("savePDF")
    .addEventListener("click", async () => {

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const name =
            document.getElementById("name").value.trim() || "anime-card";

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

        await new Promise(r => setTimeout(r, 150));

        const frontCanvas = await html2canvas(cardFront, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });

        pdf.addImage(frontCanvas.toDataURL("image/png"), "PNG", 15, 15, 180, 260);

        pdf.addPage();

        /* ================= BACK ================= */

        cardFront.style.display = "none";
        cardBack.style.display = "block";

        await new Promise(r => setTimeout(r, 150));

        const backCanvas = await html2canvas(cardBack, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
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

Object.keys(fields).forEach(id => {

    const target =
        document.getElementById(fields[id]);

    if (target) {

        target.style.display = "none";

    }

});

/* ========================= */
/* DEFAULT CARD NAME */
/* ========================= */

document.getElementById("cardName")
    .style.display = "block";

document.getElementById("backName")
    .style.display = "block";


if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {
                console.log("PWA Ready");
            });

    });

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

        // IMPORTANT: styles
        colors: {
            color1: document.getElementById("color1").value,
            color2: document.getElementById("color2").value,
            textColor: document.getElementById("textColor").value,
            borderColor: document.getElementById("borderColor").value
        },

        font: document.getElementById("fontSelect").value,
        templateId: document.getElementById("templateSelect").value
    };
}

const dbName = "CardCraftDB";
const storeName = "cards";
const packStore = "packs";

function openDB() {

    return new Promise((resolve, reject) => {

       const request = indexedDB.open(dbName, 2);

        request.onupgradeneeded = e => {

            const db = e.target.result;

            if (!db.objectStoreNames.contains(storeName)) {

                db.createObjectStore(storeName, {
                    keyPath: "id"
                });

            }

            if (!db.objectStoreNames.contains(packStore)) {
                db.createObjectStore(packStore, { keyPath: "id" });
            }

        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}

document.getElementById("saveLocal")
    .addEventListener("click", async () => {

        const db = await openDB();
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);

        const cardData = {
            id: Date.now(),
            ...getCardState()
        };

        store.add(cardData);

        alert("Card Saved Offline!");
    });

document.getElementById("loadCards")
    .addEventListener("click", async () => {

        const db = await openDB();

        const tx = db.transaction(storeName, "readonly");

        const store = tx.objectStore(storeName);

        const request = store.getAll();

        request.onsuccess = () => {

            // console.log(request.result);
            window.location.href = "gallery.html";

        };

    });

function importCard(file) {

    const reader = new FileReader();

    reader.onload = e => {

        const data = JSON.parse(e.target.result);

        // text
        document.getElementById("name").value = data.name;
        document.getElementById("series").value = data.series;
        document.getElementById("role").value = data.role;
        document.getElementById("desc").value = data.desc;
        document.getElementById("species").value = data.species;
        document.getElementById("gender").value = data.gender;
        document.getElementById("abilities").value = data.abilities;

        // image
        document.getElementById("cardImage").src = data.image;

        // styles
        document.getElementById("color1").value = data.colors.color1;
        document.getElementById("color2").value = data.colors.color2;
        document.getElementById("textColor").value = data.colors.textColor;
        document.getElementById("borderColor").value = data.colors.borderColor;

        document.getElementById("fontSelect").value = data.font;
        document.getElementById("templateSelect").value = data.templateId;

        // re-apply UI updates
        updateColors();

        document.getElementById("fontSelect")
            .dispatchEvent(new Event("change"));

        document.getElementById("templateSelect")
            .dispatchEvent(new Event("change"));
    };

    reader.readAsText(file);
}

async function loadGallery() {

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    const db = await openDB();
    const tx = db.transaction("cards", "readonly");
    const store = tx.objectStore("cards");

    const req = store.getAll();

    req.onsuccess = () => {

        req.result.forEach(card => {

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
        const dot = document.querySelectorAll('.dot')[i];
        
        if (i === currentSlide) {
            slide.classList.add('active');
            dot.classList.add('active');
        } else {
            slide.classList.remove('active');
            dot.classList.remove('active');
        }
    }
}

const mainGroup = document.querySelector('.profileFormGroup');
const extraFields = document.getElementById('extraFields');

function expandForm() {
    extraFields.classList.add('expanded');
}

// Closes the popup safely if you tap or click outside the component boundaries
document.addEventListener('click', function(event) {
    const isClickInside = mainGroup.contains(event.target);

    if (!isClickInside) {
        extraFields.classList.remove('expanded');
    }
});