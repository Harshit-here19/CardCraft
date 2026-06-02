# 🎴 CardCraft

[![Live Demo](https://img.shields.io/badge/🌐_Try_CardCraft-Live-success?style=for-the-badge)](https://harshit-here19.github.io/CardCraft/)
[![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-black?style=for-the-badge&logo=github)]()
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla_JS-yellow?style=for-the-badge&logo=javascript)]()

Create, customize, save, export, and collect beautiful anime-style character cards directly in your browser.

CardCraft is a Progressive Web App (PWA) that lets users design trading-card-inspired character cards with custom images, gradients, templates, fonts, rarities, and more. Cards can be stored locally using IndexedDB, exported as images or PDFs, and shared through import/export files.

---

## ✨ Features

### 🎨 Card Creation

* Custom character name
* Series / Anime name
* Character role
* Description
* Species
* Gender
* Abilities
* Rarity system

### 🖼 Image Support

* Upload images from device
* Drag & drop image upload
* Import images using URL
* Custom background images

### 🌈 Visual Customization

* Multi-color gradient backgrounds
* Custom text color
* Custom border color
* Multiple fonts
* Predefined templates
* Rarity glow effects

### 🔄 Interactive Card

* Front and back card design
* Smooth card flip animation
* Dynamic live preview

### 💾 Offline Storage

* IndexedDB integration
* Save cards locally
* Persistent storage between sessions
* No server required

### 📤 Export Options

* Export card as PNG
* Export card as PDF
* Export complete collection
* Shareable `.cardcraft` files

### 📥 Import Support

* Import exported card collections
* Duplicate detection
* Bulk card importing

### 🖼 Gallery System

* View all saved cards
* Search by series
* Filter by template
* Filter by rarity
* Delete cards individually

### 📱 Progressive Web App

* Service Worker support
* Installable on mobile devices
* Offline functionality

---

## 🛠 Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)

### Storage

* IndexedDB

### Libraries

* html2canvas
* jsPDF

### PWA

* Service Worker
* Web App Manifest

---

## 📂 Project Structure

```text
CardCraft/
│
├── index.html
├── gallery.html
├── view.html
│
├── js/
│   ├── script.js
│   ├── gallery.js
│   └── view.js
│
├── templates.json
├── service-worker.js
│
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
└── README.md
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/yourusername/cardcraft.git
```

```bash
cd cardcraft
```

### Run Locally

Because the application uses:

* Fetch API
* Service Workers
* IndexedDB

it should be served through a local web server.

Example using VS Code:

1. Install Live Server extension
2. Right-click `index.html`
3. Select **Open with Live Server**

---

## 🎮 How To Use

### Create a Card

1. Enter character details.
2. Upload an image.
3. Select a template.
4. Customize colors and fonts.
5. Add rarity and additional information.
6. Preview updates instantly.

### Save Card

Click:

```text
Save Offline
```

The card will be stored in IndexedDB.

### View Collection

Click:

```text
Load Cards
```

to open the gallery.

### Export PNG

Click:

```text
Save Image
```

Downloads the front card as a PNG image.

### Export PDF

Click:

```text
Save PDF
```

Creates a PDF containing:

* Front side
* Back side

of the card.

### Export Collection

From the gallery:

```text
Export Collection
```

Downloads all cards into:

```text
export.cardcraft
```

### Import Collection

1. Open Gallery.
2. Click Import.
3. Select a `.cardcraft` file.
4. Existing duplicates will automatically be skipped.

---

## 🗃 Card Data Format

Example saved card:

```json
{
  "id": 17123456789,
  "name": "Naruto Uzumaki",
  "series": "Naruto",
  "role": "Hokage",
  "rarity": "Legendary",
  "species": "Human",
  "gender": "Male",
  "abilities": "Rasengan, Sage Mode",
  "image": "data:image/png;base64,...",
  "backgroundImage": null,
  "colors": {
    "color1": "#ff6600",
    "color2": "#ffaa00",
    "textColor": "#ffffff",
    "borderColor": "#000000"
  },
  "font": "Poppins",
  "templateId": "legendary"
}
```

---

## 🔍 Gallery Features

### Search

Search cards by:

* Series name

### Filter

Filter cards by:

* Template
* Rarity

### Delete

Delete cards permanently from local storage.

---

## 📦 Templates

Templates are loaded dynamically from:

```text
templates.json
```

Each template supports:

```json
{
  "id": "legendary",
  "name": "Legendary",
  "background": "linear-gradient(...)",
  "textColor": "#ffffff",
  "borderColor": "#ffd700",
  "font": "Poppins",
  "cardShadow": "...",
  "rarityGlow": "..."
}
```

---

## 🔒 Privacy

CardCraft is completely client-side.

* No account required
* No cloud database
* No user tracking
* No external storage

All card data remains on the user's device unless explicitly exported.

---

## 🧩 Future Improvements

Potential roadmap:

* Pack creation system
* Trading card collections
* Card sharing via URL
* Online synchronization
* Animation effects
* Custom rarity editor
* Template marketplace
* Statistics dashboard
* Card pack opening experience

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Created with ❤️ using Vanilla JavaScript.

If you found this project useful, consider giving it a ⭐ on GitHub.
