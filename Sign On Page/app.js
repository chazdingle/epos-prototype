"use strict";

// One staff list drives the entire sign-on screen.
// today is sample roster data, not connected to live rotas.
const STAFF = [
  { id: "charlie", name: "Charlie", initials: "CB", today: true, initialsX: 74 },
  { id: "rowan", name: "Rowan", initials: "RW", today: true, initialsX: 73, initialsY: 363, initialsSize: 25 },
  { id: "kelly", name: "Kelly", initials: "KB", today: true, initialsX: 74 },
  { id: "tim", name: "Tim", initials: "TB", today: true, initialsX: 76 },
  { id: "rob", name: "Rob", initials: "RD", today: true, initialsX: 74 },
  { id: "tracy", name: "Tracy", initials: "TO", today: true, initialsX: 74 }
];

const artwork = document.getElementById("sign-on-artwork");
const slots = [...artwork.querySelectorAll("[data-staff-slot]")];
const tabs = [...artwork.querySelectorAll("[data-staff-tab]")];
const emptyPanel = artwork.querySelector("[data-empty-panel]");
const pinPanel = artwork.querySelector("[data-pin-panel]");
const pinName = pinPanel.querySelector("[data-pin-name] tspan");
const dots = [...pinPanel.querySelectorAll("[data-pin-dot]")];
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("staff-search");
const noMatches = document.getElementById("no-matches");
const status = document.getElementById("status");
const result = document.getElementById("demo-result");

let mode = "today";
let selectedStaff = null;
let pin = "";
let page = 0;

function show(element, visible) {
  element.toggleAttribute("hidden", !visible);
}

// Make SVG groups behave as keyboard-accessible buttons as well as touch targets.
function activate(element, callback) {
  element.addEventListener("click", callback);
  element.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      callback();
    }
  });
}

function matchingStaff() {
  if (mode === "today") return STAFF.filter(person => person.today);
  const query = searchInput.value.trim().toLocaleLowerCase("en-GB");
  return STAFF.filter(person => person.name.toLocaleLowerCase("en-GB").startsWith(query))
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
}

function renderStaff() {
  const people = matchingStaff();
  const maxPage = Math.max(0, Math.ceil(people.length / slots.length) - 1);
  page = Math.min(page, maxPage);
  slots.forEach((slot, index) => {
    const person = people[page * slots.length + index];
    show(slot, Boolean(person));
    if (!person) {
      delete slot.dataset.personId;
      return;
    }
    slot.dataset.personId = person.id;
    slot.setAttribute("aria-label", person.name);
    const selected = person.id === selectedStaff?.id;
    slot.setAttribute("aria-pressed", String(selected));
    slot.querySelector("[data-card-name] tspan").textContent = person.name;
    const initials = slot.querySelector("[data-avatar-initials]");
    initials.setAttribute("transform", `translate(${person.initialsX ?? 74} ${person.initialsY ?? 364})`);
    initials.setAttribute("font-size", String(person.initialsSize ?? 30));
    initials.querySelector("tspan").textContent = person.initials;
    const card = slot.querySelector("[data-card-background]");
    card.setAttribute("fill", selected ? "#b7d7b0" : "#eaeaea");
    card.setAttribute("stroke", selected ? "#5d9a64" : "#707070");
    const avatar = slot.querySelector("[data-avatar-background]");
    avatar.setAttribute("fill", selected ? "#5d9a64" : "#263854");
    avatar.setAttribute("stroke", selected ? "#5d9a64" : person.id === "charlie" ? "#818182" : "#707070");
  });
  show(noMatches, people.length === 0);
  show(pager, maxPage > 0);
  previous.setAttribute("aria-disabled", String(page === 0));
  next.setAttribute("aria-disabled", String(page === maxPage));
  pageLabel.textContent = `${page + 1} / ${maxPage + 1}`;
}

function renderPin() {
  show(emptyPanel, !selectedStaff);
  show(pinPanel, Boolean(selectedStaff));
  if (selectedStaff) pinName.textContent = selectedStaff.name;
  dots.forEach((dot, index) => dot.setAttribute("fill", index < pin.length ? "#263854" : "#fff"));
  status.textContent = selectedStaff
    ? `${selectedStaff.name} selected. ${pin.length} of 4 PIN digits entered.`
    : "Select your name to continue.";
}

function selectStaff(personId) {
  selectedStaff = STAFF.find(person => person.id === personId) ?? null;
  pin = ""; // Changing staff always clears the previous PIN.
  renderStaff();
  renderPin();
}

function setMode(value) {
  mode = value;
  page = 0;
  searchInput.value = "";
  show(searchPanel, mode === "all");
  tabs.forEach(tab => {
    const active = tab.dataset.staffTab === mode;
    tab.setAttribute("aria-pressed", String(active));
    const rectangle = tab.querySelector("g");
    rectangle.setAttribute("fill", active ? "#385076" : "#eaeaea");
    rectangle.setAttribute("stroke", active ? "#fff" : "#707070");
    tab.querySelector("text").setAttribute("fill", active ? "#fff" : "#263854");
  });
  renderStaff();
  if (mode === "all") searchInput.focus();
}

function enterKey(value) {
  if (!selectedStaff) return;
  if (value === "C") pin = "";
  else if (value === "Backspace") pin = pin.slice(0, -1);
  else pin = (pin + value).slice(0, 4);
  renderPin();
}

function signOn() {
  if (!selectedStaff || pin.length !== 4) {
    status.textContent = "Enter four PIN digits before signing on.";
    if (selectedStaff) {
      dots.forEach(dot => dot.setAttribute("stroke", "#b54141"));
      window.setTimeout(() => dots.forEach(dot => dot.setAttribute("stroke", "#263854")), 700);
    }
    return;
  }
  const staff = selectedStaff;
  pin = "";
  renderPin();
  // Demo only: any four digits are accepted. No real authentication or storage.
  // Connect Sales Mode by handling this event later.
  const event = new CustomEvent("epos:signon", {
    detail: { staffId: staff.id, name: staff.name }, cancelable: true
  });
  const useDemoResult = window.dispatchEvent(event);
  if (useDemoResult) {
    document.getElementById("demo-result-text").textContent =
      `${staff.name} signed on in the demo. Sales Mode has not been connected yet.`;
    show(result, true);
    artwork.setAttribute("inert", "");
    document.getElementById("dismiss-result").focus();
  }
}

slots.forEach(slot => activate(slot, () => selectStaff(slot.dataset.personId)));
tabs.forEach(tab => activate(tab, () => setMode(tab.dataset.staffTab)));
pinPanel.querySelectorAll("[data-key]").forEach(key => activate(key, () => enterKey(key.dataset.key)));
activate(pinPanel.querySelector("[data-sign-on]"), signOn);

searchInput.addEventListener("input", () => {
  page = 0;
  renderStaff();
  status.textContent = `${matchingStaff().length} matching staff.`;
});

document.addEventListener("keydown", event => {
  if (event.ctrlKey || event.metaKey || event.altKey || !result.hidden) return;
  if (event.target === searchInput) return;
  if (/^[0-9]$/.test(event.key) || event.key === "Backspace" || event.key === "Escape") {
    event.preventDefault();
    enterKey(event.key === "Escape" ? "C" : event.key);
  } else if (event.key === "Enter" && !event.target.closest(".ui-button, button")) {
    signOn();
  }
});

document.getElementById("dismiss-result").addEventListener("click", () => {
  show(result, false);
  artwork.removeAttribute("inert");
  selectStaff(null);
  slots.find(slot => !slot.hasAttribute("hidden"))?.focus();
});

// Paging is only shown if the editable list grows beyond six visible staff.
// The original six-person layout stays untouched.
const NS = "http://www.w3.org/2000/svg";
function svgElement(tag, attributes, text) {
  const element = document.createElementNS(NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (text) element.textContent = text;
  return element;
}
const pager = svgElement("g", { hidden: "", "aria-label": "Staff pages" });
const previous = svgElement("g", { role: "button", tabindex: "0", class: "ui-button", "aria-label": "Previous staff page" });
const next = svgElement("g", { role: "button", tabindex: "0", class: "ui-button", "aria-label": "Next staff page" });
for (const [button, x, label] of [[previous, 49, "Previous"], [next, 384, "Next"]]) {
  button.append(svgElement("rect", { x, y: 616, width: 120, height: 37, rx: 9, fill: "#eaeaea", stroke: "#707070" }));
  button.append(svgElement("text", { x: x + 60, y: 641, "text-anchor": "middle", fill: "#263854", "font-size": 18, "font-weight": 600 }, label));
  pager.append(button);
}
const pageLabel = svgElement("text", { x: 276, y: 641, "text-anchor": "middle", fill: "#263854", "font-size": 18, "font-weight": 600 });
pager.append(pageLabel);
artwork.append(pager);
activate(previous, () => { page = Math.max(0, page - 1); renderStaff(); });
activate(next, () => { page = Math.min(Math.ceil(matchingStaff().length / 6) - 1, page + 1); renderStaff(); });

setMode("today");
renderPin();
