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
    .addEventListener("input", e => {

        const url = e.target.value.trim();

        if (url !== "") {

            document.getElementById("cardImage")
                .src = url;

        }

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