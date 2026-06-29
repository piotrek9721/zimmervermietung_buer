const STORAGE_KEY = "zimmervermietung-site-data";

const defaultData = {
  version: 2,
  business: {
    name: "Private Zimmervermietung Familie Schrödel",
    location: "Gelsenkirchen-Buer",
    address: "Hugostraße 42, 45897 Gelsenkirchen",
    email: "PZV.Schroedel@aol.com",
    phone: "+49 (0)209 594318",
    mobile: "+49 (0)172 2823848",
  },
  rooms: [
    {
      id: "zimmer-1",
      title: "Einzelzimmer",
      price: "ab 40 EUR / Nacht",
      availability: "1 Zimmer, max. 1 Person",
      image: "assets/einzelzimmer-1.jpg",
      images: [
        { src: "assets/einzelzimmer-1.jpg", alt: "Einzelzimmer mit Bett und Nachttisch" },
        { src: "assets/einzelzimmer-2.jpg", alt: "Einzelzimmer mit Bett, Sitzplatz und TV" },
        { src: "assets/einzelzimmer-bad-1.jpg", alt: "Modernes Bad mit Waschbecken, WC und Dusche" },
        { src: "assets/einzelzimmer-bad-2.jpg", alt: "Bad mit Dusche und Fenster" },
      ],
      description: "Gemütlich und familiär eingerichtetes Einzelzimmer mit Zugang zu moderner Gemeinschaftsküche und Sanitärbereich.",
      features: ["1 Person", "Kostenloses WLAN", "TV", "Nichtraucherzimmer"],
    },
    {
      id: "zimmer-2",
      title: "Doppelzimmer",
      price: "ab 80 EUR / Nacht",
      availability: "3 Zimmer, max. 2 Personen",
      image: "assets/zimmer-2.jpg",
      description: "Doppelzimmer für bis zu zwei Personen, geeignet für Monteure, Geschäftsreisende und private Aufenthalte.",
      features: ["bis 2 Personen", "Kostenloses WLAN", "Handtücher", "Bettwäsche"],
    },
    {
      id: "zimmer-3",
      title: "Mehrbettzimmer / Familienzimmer",
      price: "Preis auf Anfrage",
      availability: "auf Anfrage",
      image: "assets/zimmer-3.jpg",
      description: "Weitere Schlafmöglichkeiten und Familienzimmer bitte direkt anfragen. Langzeitbuchungen sind möglich.",
      features: ["Familienzimmer", "Langzeitbuchung", "Monteurzimmer", "Selbstverpflegung"],
    },
  ],
};

let state = loadState();

const roomList = document.querySelector("[data-room-list]");
const roomSelect = document.querySelector("[data-room-select]");
const adminRoomSelect = document.querySelector("[data-admin-room-select]");
const inquiryForm = document.querySelector("[data-inquiry-form]");
const businessForm = document.querySelector("[data-business-form]");
const roomForm = document.querySelector("[data-room-form]");
const formStatus = document.querySelector("[data-form-status]");
const adminSection = document.querySelector("[data-admin-section]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");

setupAdminVisibility();
setupLightbox();

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.version === defaultData.version ? parsed : structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  renderBusiness();
  renderRooms();
  renderRoomOptions();
  if (businessForm && roomForm) {
    hydrateBusinessForm();
    hydrateRoomForm();
  }
  applyPhotoSlots();
  prepareLightboxTriggers();
}

function setupAdminVisibility() {
  const params = new URLSearchParams(window.location.search);
  const isAdminView = params.get("admin") === "1" || window.location.hash === "#admin";
  if (adminSection && isAdminView) {
    adminSection.hidden = false;
  }
}

function renderBusiness() {
  document.querySelectorAll("[data-business-name]").forEach((node) => {
    node.textContent = state.business.name;
  });
  document.querySelectorAll("[data-business-location]").forEach((node) => {
    node.textContent = state.business.location;
  });

  const emailLinks = document.querySelectorAll("[data-contact-email]");
  emailLinks.forEach((link) => {
    link.textContent = state.business.email;
    link.href = `mailto:${state.business.email}`;
  });

  const phoneLinks = document.querySelectorAll("[data-contact-phone]");
  phoneLinks.forEach((link) => {
    link.textContent = `Festnetz: ${state.business.phone}`;
    link.href = `tel:${toTelHref(state.business.phone)}`;
  });

  const mobileLinks = document.querySelectorAll("[data-contact-mobile]");
  mobileLinks.forEach((link) => {
    link.textContent = `Mobil: ${state.business.mobile}`;
    link.href = `tel:${toTelHref(state.business.mobile)}`;
  });

  document.querySelectorAll("[data-contact-address]").forEach((node) => {
    node.textContent = state.business.address;
  });
}

function renderRooms() {
  roomList.innerHTML = state.rooms
    .map((room) => {
      const features = room.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
      const gallery = renderRoomGallery(room);
      return `
        <article class="room-card">
          <div class="photo-slot" data-photo-src="${escapeHtml(room.image)}">
            <span>Foto einpflegen: ${escapeHtml(room.image)}</span>
          </div>
          <div class="room-body">
            <div class="room-meta">
              <span class="tag">${escapeHtml(room.availability)}</span>
            </div>
            <h3>${escapeHtml(room.title)}</h3>
            <p class="price">${escapeHtml(room.price)}</p>
            <p>${escapeHtml(room.description)}</p>
            ${gallery}
            <ul class="feature-list">${features}</ul>
            <div class="room-actions">
              <a class="button secondary" href="#anfrage" data-select-room="${escapeHtml(room.id)}">Anfragen</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  roomList.querySelectorAll("[data-select-room]").forEach((link) => {
    link.addEventListener("click", () => {
      roomSelect.value = link.dataset.selectRoom;
    });
  });
}

function renderRoomGallery(room) {
  if (!Array.isArray(room.images) || room.images.length === 0) {
    return "";
  }

  const images = room.images
    .map(
      (image) => `
        <figure class="room-gallery-item">
          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" tabindex="0" data-lightbox-src="${escapeHtml(image.src)}">
        </figure>
      `,
    )
    .join("");

  return `<div class="room-gallery" aria-label="Bilder ${escapeHtml(room.title)}">${images}</div>`;
}

function renderRoomOptions() {
  const options = state.rooms
    .map((room) => `<option value="${escapeHtml(room.id)}">${escapeHtml(room.title)}</option>`)
    .join("");

  roomSelect.innerHTML = `<option value="">Bitte waehlen</option>${options}`;
  if (adminRoomSelect) {
    adminRoomSelect.innerHTML = options;
  }
}

function hydrateBusinessForm() {
  businessForm.elements.name.value = state.business.name;
  businessForm.elements.location.value = state.business.location;
  businessForm.elements.email.value = state.business.email;
  businessForm.elements.phone.value = state.business.phone;
  businessForm.elements.mobile.value = state.business.mobile;
  businessForm.elements.address.value = state.business.address;
}

function hydrateRoomForm() {
  const selectedRoom = state.rooms.find((room) => room.id === adminRoomSelect.value) || state.rooms[0];
  if (!selectedRoom) return;

  adminRoomSelect.value = selectedRoom.id;
  roomForm.elements.title.value = selectedRoom.title;
  roomForm.elements.price.value = selectedRoom.price;
  roomForm.elements.availability.value = selectedRoom.availability;
  roomForm.elements.image.value = selectedRoom.image;
  roomForm.elements.description.value = selectedRoom.description;
  roomForm.elements.features.value = selectedRoom.features.join(", ");
}

function applyPhotoSlots() {
  document.querySelectorAll("[data-photo-src]").forEach((slot) => {
    const imagePath = slot.dataset.photoSrc;
    if (!imagePath) return;

    const probe = new Image();
    probe.onload = () => {
      slot.classList.add("has-image");
      slot.style.backgroundImage = `url("${imagePath}")`;
      slot.dataset.lightboxSrc = imagePath;
      slot.classList.add("is-clickable-image");
      slot.tabIndex = 0;
      slot.setAttribute("role", "button");
      slot.setAttribute("aria-label", "Bild groß ansehen");
    };
    probe.onerror = () => {
      slot.classList.remove("has-image");
      slot.classList.remove("is-clickable-image");
      slot.style.backgroundImage = "";
      slot.removeAttribute("data-lightbox-src");
      slot.removeAttribute("tabindex");
      slot.removeAttribute("role");
      slot.removeAttribute("aria-label");
    };
    probe.src = imagePath;
  });
}

function prepareLightboxTriggers() {
  document.querySelectorAll(".room-gallery img, .building-gallery img, .kitchen-gallery img").forEach((image) => {
    image.tabIndex = 0;
    image.dataset.lightboxSrc = image.dataset.lightboxSrc || image.getAttribute("src");
  });
}

function setupLightbox() {
  if (!lightbox || !lightboxImage) return;

  document.addEventListener("click", (event) => {
    const trigger = findLightboxTrigger(event.target);
    if (!trigger) return;

    event.preventDefault();
    openLightbox(getLightboxSource(trigger));
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.hidden) {
      if (event.key === "Escape") {
        closeLightbox();
      }
      if (event.key === "ArrowLeft") {
        moveLightbox(-1);
      }
      if (event.key === "ArrowRight") {
        moveLightbox(1);
      }
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;
    const trigger = findLightboxTrigger(event.target);
    if (!trigger) return;

    event.preventDefault();
    openLightbox(getLightboxSource(trigger));
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.querySelector("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
  document.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => moveLightbox(-1));
  document.querySelector("[data-lightbox-next]")?.addEventListener("click", () => moveLightbox(1));
}

let lightboxItems = [];
let lightboxIndex = 0;

function openLightbox(source) {
  if (!source) return;

  lightboxItems = getLightboxItems();
  lightboxIndex = Math.max(
    0,
    lightboxItems.findIndex((item) => item.src === source),
  );
  showLightboxImage();
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  document.querySelector("[data-lightbox-close]")?.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
}

function moveLightbox(direction) {
  if (lightboxItems.length === 0) return;

  lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
  showLightboxImage();
}

function showLightboxImage() {
  const current = lightboxItems[lightboxIndex];
  if (!current) return;

  lightboxImage.src = current.src;
  lightboxImage.alt = current.alt;
  if (lightboxCaption) {
    lightboxCaption.textContent = current.alt;
  }
}

function getLightboxItems() {
  const triggers = [...document.querySelectorAll("[data-lightbox-src], .room-gallery img, .building-gallery img, .kitchen-gallery img")];
  const items = triggers
    .map((trigger) => ({
      src: getLightboxSource(trigger),
      alt: trigger.getAttribute("alt") || trigger.getAttribute("aria-label") || "Bild der Unterkunft",
    }))
    .filter((item) => item.src);

  return items.filter((item, index) => items.findIndex((entry) => entry.src === item.src) === index);
}

function getLightboxSource(trigger) {
  return trigger.dataset.lightboxSrc || trigger.getAttribute("src") || "";
}

function findLightboxTrigger(target) {
  if (!(target instanceof Element)) return null;
  return target.closest("[data-lightbox-src], .room-gallery img, .building-gallery img, .kitchen-gallery img");
}

businessForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.business = {
    name: businessForm.elements.name.value.trim(),
    location: businessForm.elements.location.value.trim(),
    email: businessForm.elements.email.value.trim(),
    phone: businessForm.elements.phone.value.trim(),
    mobile: businessForm.elements.mobile.value.trim(),
    address: businessForm.elements.address.value.trim(),
  };
  saveState();
  render();
});

adminRoomSelect?.addEventListener("change", hydrateRoomForm);

roomForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const roomId = roomForm.elements.roomId.value;
  const room = state.rooms.find((entry) => entry.id === roomId);
  if (!room) return;

  room.title = roomForm.elements.title.value.trim();
  room.price = roomForm.elements.price.value.trim();
  room.availability = roomForm.elements.availability.value.trim();
  room.image = roomForm.elements.image.value.trim();
  room.description = roomForm.elements.description.value.trim();
  room.features = roomForm.elements.features.value
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);

  saveState();
  render();
});

inquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(inquiryForm);
  const selectedRoom = state.rooms.find((room) => room.id === formData.get("room"));
  const subject = encodeURIComponent(`Zimmeranfrage: ${selectedRoom?.title || "Zimmer"}`);
  const body = encodeURIComponent(
    [
      `Name: ${formData.get("name")}`,
      `E-Mail: ${formData.get("email")}`,
      `Telefon: ${formData.get("phone") || "-"}`,
      `Zimmer: ${selectedRoom?.title || formData.get("room")}`,
      `Anreise: ${formData.get("arrival")}`,
      `Abreise: ${formData.get("departure")}`,
      "",
      `Nachricht: ${formData.get("message") || "-"}`,
    ].join("\n"),
  );

  formStatus.textContent = "Die Anfrage wurde als E-Mail vorbereitet.";
  window.location.href = `mailto:${state.business.email}?subject=${subject}&body=${body}`;
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toTelHref(value) {
  return String(value).replace(/[^\d+]/g, "");
}

render();
