"use strict";

// One staff list drives the entire sign-on screen.
// today is sample roster data, not connected to live rotas.
const STAFF = [
  { id: "charlie", name: "Charlie", initials: "CB", today: true, initialsX: 74 },
  { id: "rowan", name: "Rowan", initials: "RW", today: true, initialsX: 73, initialsY: 363, initialsSize: 25 },
  { id: "kelly", name: "Kelly", initials: "KB", today: true, initialsX: 74 },
  { id: "tim", name: "Tim", initials: "TB", today: true, initialsX: 76 },
  { id: "rob", name: "Rob", initials: "RD", today: true, initialsX: 74 },
  { id: "tracy", name: "Tracy", initials: "TO", today: true, initialsX: 74 },
  // Example names for show. They appear only in All Staff.
  { id: "abbie", name: "Abbie", initials: "AH", today: false },
  { id: "aiden", name: "Aiden", initials: "AM", today: false },
  { id: "amira", name: "Amira", initials: "AK", today: false },
  { id: "bella", name: "Bella", initials: "BW", today: false },
  { id: "ben", name: "Ben", initials: "BT", today: false },
  { id: "callum", name: "Callum", initials: "CR", today: false },
  { id: "chloe", name: "Chloe", initials: "CS", today: false },
  { id: "daisy", name: "Daisy", initials: "DF", today: false },
  { id: "dylan", name: "Dylan", initials: "DP", today: false },
  { id: "ella", name: "Ella", initials: "EJ", today: false },
  { id: "ethan", name: "Ethan", initials: "EC", today: false },
  { id: "finn", name: "Finn", initials: "FG", today: false },
  { id: "freya", name: "Freya", initials: "FL", today: false },
  { id: "george", name: "George", initials: "GH", today: false },
  { id: "grace", name: "Grace", initials: "GW", today: false },
  { id: "harry", name: "Harry", initials: "HB", today: false },
  { id: "holly", name: "Holly", initials: "HM", today: false },
  { id: "isla", name: "Isla", initials: "IR", today: false },
  { id: "jack", name: "Jack", initials: "JD", today: false },
  { id: "jasmine", name: "Jasmine", initials: "JN", today: false },
  { id: "kai", name: "Kai", initials: "KT", today: false },
  { id: "leo", name: "Leo", initials: "LP", today: false },
  { id: "lily", name: "Lily", initials: "LA", today: false },
  { id: "mason", name: "Mason", initials: "MC", today: false },
  { id: "mia", name: "Mia", initials: "MW", today: false },
  { id: "noah", name: "Noah", initials: "NE", today: false },
  { id: "olivia", name: "Olivia", initials: "OS", today: false },
  { id: "priya", name: "Priya", initials: "PS", today: false },
  { id: "ruby", name: "Ruby", initials: "RH", today: false },
  { id: "sam", name: "Sam", initials: "SK", today: false },
  { id: "sophie", name: "Sophie", initials: "SL", today: false },
  { id: "theo", name: "Theo", initials: "TA", today: false },
  { id: "violet", name: "Violet", initials: "VB", today: false },
  { id: "will", name: "Will", initials: "WF", today: false },
  { id: "yasmin", name: "Yasmin", initials: "YO", today: false },
  { id: "zara", name: "Zara", initials: "ZM", today: false }
];

const artwork = document.getElementById("sign-on-artwork");
const slots = [...artwork.querySelectorAll("[data-staff-slot]")];
const tabs = [...artwork.querySelectorAll("[data-staff-tab]")];
const emptyPanel = artwork.querySelector("[data-empty-panel]");
const pinPanel = artwork.querySelector("[data-pin-panel]");
const pinName = pinPanel.querySelector("[data-pin-name] tspan");
const dots = [...pinPanel.querySelectorAll("[data-pin-dot]")];
const allPanel = document.getElementById("all-staff-panel");
const searchInput = document.getElementById("staff-search");
const staffList = document.getElementById("all-staff-list");
const azIndex = document.getElementById("az-index");
const ALPHABET = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const status = document.getElementById("status");
const sessionScreens = document.getElementById("session-screens");
const welcomeScreen = document.getElementById("welcome-screen");
const homeScreen = document.getElementById("home-screen");
const signOutButton = document.getElementById("sign-out");

// How long the welcome message shows before moving to the homepage.
const WELCOME_MS = 300;

let mode = "today";
let welcomeTimer = null;
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

function nameStartsWith(person, text) {
  return person.name.toLocaleLowerCase("en-GB").startsWith(text.trim().toLocaleLowerCase("en-GB"));
}

function matchingStaff() {
  if (mode === "today") return STAFF.filter(person => person.today);
  return STAFF.filter(person => nameStartsWith(person, searchInput.value))
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
}

function firstLetter(person) {
  return person.name[0].toLocaleUpperCase("en-GB");
}

function htmlElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

// All Staff: rebuild the A–Z list whenever the search changes.
function renderAllStaff() {
  const groups = new Map();
  for (const person of matchingStaff()) {
    const letter = firstLetter(person);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(person);
  }
  staffList.replaceChildren(...[...groups].map(([letter, people]) => {
    const section = htmlElement("section");
    section.dataset.letter = letter;
    const grid = htmlElement("div", "letter-group");
    for (const person of people) {
      const card = htmlElement("button", "staff-card");
      card.type = "button";
      card.dataset.personId = person.id;
      card.setAttribute("aria-label", person.name);
      const avatar = htmlElement("span", "staff-avatar", person.initials);
      avatar.classList.toggle("wide", /[MW]/.test(person.initials));
      card.append(avatar, htmlElement("span", "staff-name", person.name));
      grid.append(card);
    }
    section.append(htmlElement("h3", "letter-heading", letter), grid);
    return section;
  }));
  if (groups.size === 0) staffList.append(htmlElement("p", "no-matches", "No matching staff"));
  [...azIndex.children].forEach(button => { button.disabled = !groups.has(button.textContent); });
  staffList.scrollTop = 0;
}

function renderStaff() {
  show(allPanel, mode === "all");
  if (mode === "all") {
    slots.forEach(slot => show(slot, false));
    show(pager, false);
    staffList.querySelectorAll(".staff-card").forEach(card =>
      card.setAttribute("aria-pressed", String(card.dataset.personId === selectedStaff?.id)));
    return;
  }
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
  show(pager, maxPage > 0);
  previous.setAttribute("aria-disabled", String(page === 0));
  next.setAttribute("aria-disabled", String(page === maxPage));
  pageLabel.textContent = `${page + 1} / ${maxPage + 1}`;
}

// Right-hand panel: PIN pad once someone is selected. Otherwise All Staff
// shows the on-screen keyboard and Today shows "No name selected".
function renderPin() {
  show(emptyPanel, !selectedStaff && mode !== "all");
  show(keyboardPanel, !selectedStaff && mode === "all");
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
  if (mode === "all") renderAllStaff();
  tabs.forEach(tab => {
    const active = tab.dataset.staffTab === mode;
    tab.setAttribute("aria-pressed", String(active));
    const rectangle = tab.querySelector("g");
    rectangle.setAttribute("fill", active ? "#385076" : "#eaeaea");
    rectangle.setAttribute("stroke", active ? "#fff" : "#707070");
    tab.querySelector("text").setAttribute("fill", active ? "#fff" : "#263854");
  });
  renderStaff();
  renderPin();
  renderKeyboard();
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
  if (window.dispatchEvent(event)) showWelcome(staff);
}

// Welcome the signed-on staff member, then move to the homepage.
function showWelcome(staff) {
  selectStaff(null); // Reset the sign-on screen behind the session screens.
  artwork.setAttribute("inert", "");
  document.getElementById("welcome-initials").textContent = staff.initials;
  document.getElementById("welcome-name").textContent = `Welcome, ${staff.name}`;
  document.getElementById("home-staff-name").textContent = staff.name;
  show(homeScreen, false);
  show(welcomeScreen, true);
  show(sessionScreens, true);
  sessionScreens.focus();
  status.textContent = `Welcome, ${staff.name}. Taking you to your homepage.`;
  welcomeTimer = window.setTimeout(showHome, WELCOME_MS);
}

function showHome() {
  window.clearTimeout(welcomeTimer);
  welcomeTimer = null;
  show(welcomeScreen, false);
  show(homeScreen, true);
  document.title = "Krispies EPOS — Home";
  status.textContent = "Homepage.";
}

function signOut() {
  show(sessionScreens, false);
  show(homeScreen, false);
  artwork.removeAttribute("inert");
  document.title = "Krispies EPOS — Sign on";
  setMode("today"); // The next person starts from a fresh Today list.
  slots.find(slot => !slot.hasAttribute("hidden"))?.focus();
}

slots.forEach(slot => activate(slot, () => selectStaff(slot.dataset.personId)));
tabs.forEach(tab => activate(tab, () => setMode(tab.dataset.staffTab)));
pinPanel.querySelectorAll("[data-key]").forEach(key => activate(key, () => enterKey(key.dataset.key)));
activate(pinPanel.querySelector("[data-sign-on]"), signOn);

// Searching again means choosing someone else: clear the selection and PIN
// so the keyboard replaces the PIN pad.
function searchChanged() {
  if (selectedStaff) selectStaff(null);
  renderAllStaff();
  renderStaff();
  renderKeyboard();
  status.textContent = `${matchingStaff().length} matching staff.`;
}

searchInput.addEventListener("input", () => {
  searchInput.value = searchInput.value.toLocaleUpperCase("en-GB");
  searchChanged();
});
searchInput.addEventListener("click", () => {
  if (selectedStaff) selectStaff(null);
});

staffList.addEventListener("click", event => {
  const card = event.target.closest(".staff-card");
  if (card) selectStaff(card.dataset.personId);
});

// A–Z jump bar: letters with no matching staff are disabled.
azIndex.append(...ALPHABET.map(letter => {
  const button = htmlElement("button", "", letter);
  button.type = "button";
  button.setAttribute("aria-label", `Jump to ${letter}`);
  button.addEventListener("click", () => {
    const section = staffList.querySelector(`[data-letter="${letter}"]`);
    if (section) staffList.scrollTo({ top: section.offsetTop, behavior: "smooth" });
  });
  return button;
}));

document.addEventListener("keydown", event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (!sessionScreens.hasAttribute("hidden")) {
    // Any key on the welcome message skips straight to the homepage.
    if (!welcomeScreen.hasAttribute("hidden") && !event.repeat) showHome();
    return;
  }
  if (event.target === searchInput) return;
  if (/^[0-9]$/.test(event.key) || event.key === "Backspace" || event.key === "Escape") {
    event.preventDefault();
    enterKey(event.key === "Escape" ? "C" : event.key);
  } else if (event.key === "Enter" && !event.target.closest(".ui-button, button")) {
    signOn();
  }
});

welcomeScreen.addEventListener("click", showHome);
activate(signOutButton, signOut);

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

// On-screen A–Z keyboard for All Staff search, in the PIN panel's style.
// Its panel is wider than the PIN panel (from beside the A–Z strip to the
// screen edge) so the keys are large enough for touchscreen use.
// It is a one-letter quick search: tapping a letter shows the names starting
// with it. Keys type into the search bar without taking its focus.
const PANEL_X = 552;
const PANEL_WIDTH = 460;
const KEYS_X = PANEL_X + 14;
const KEYS_WIDTH = PANEL_WIDTH - 28;
const KEY_COLUMNS = 6;
const KEY_GAP = 8;
const KEY_WIDTH = (KEYS_WIDTH - (KEY_COLUMNS - 1) * KEY_GAP) / KEY_COLUMNS;
const KEY_HEIGHT = 74;
const KEY_STEP = KEY_WIDTH + KEY_GAP;
const KEY_ROW_STEP = KEY_HEIGHT + KEY_GAP;
const KEYS_Y = 268;
const keyboardPanel = svgElement("g", { hidden: "", "aria-label": "On-screen keyboard" });
keyboardPanel.append(
  svgElement("rect", { x: PANEL_X + 0.5, y: 115.5, width: PANEL_WIDTH - 1, height: 569, rx: 19.5, fill: "#f2f2f2", stroke: "#707070" }),
  svgElement("text", { x: KEYS_X + 1, y: 162, fill: "#263854", "font-size": 35, "font-weight": 700, "letter-spacing": "-0.05em" }, "Search"),
  svgElement("rect", { x: KEYS_X + 0.5, y: 185.5, width: KEYS_WIDTH - 1, height: 63, rx: 24.5, fill: "#f0f0f0", stroke: "#707070" })
);
const searchDisplay = svgElement("text", {
  x: KEYS_X + 24, y: 227, fill: "#263854", "font-size": 28, "font-weight": 700, "letter-spacing": "-0.05em"
});
keyboardPanel.append(searchDisplay);
const letterKeys = new Map();

function chosenLetter() {
  return searchInput.value.trim().toLocaleUpperCase("en-GB");
}

// With no letter chosen, letters no name starts with are greyed out.
// Once a letter is chosen it is highlighted and every other letter greys out;
// tapping it again, or Clear, brings the others back.
function renderKeyboard() {
  const chosen = chosenLetter();
  searchDisplay.textContent = chosen;
  letterKeys.forEach((button, letter) => {
    const selected = letter === chosen;
    const available = chosen ? selected : STAFF.some(person => nameStartsWith(person, letter));
    button.setAttribute("aria-disabled", String(!available));
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("tabindex", available ? "0" : "-1");
    const rectangle = button.querySelector("rect");
    rectangle.setAttribute("fill", selected ? "#385076" : available ? "#eaeaea" : "#f2f2f2");
    rectangle.setAttribute("stroke", selected ? "#fff" : available ? "#707070" : "#cfcfcf");
    button.querySelector("text").setAttribute("fill", selected ? "#fff" : available ? "#263854" : "#b5b5b5");
  });
}

function typeKey(key) {
  if (key === "Clear" || key === chosenLetter()) searchInput.value = "";
  else if (letterKeys.get(key).getAttribute("aria-disabled") === "true") return;
  else searchInput.value = key;
  searchChanged();
}

function keyboardKey(key, label, x, y, width) {
  const button = svgElement("g", { role: "button", tabindex: "0", class: "ui-button", "aria-label": label });
  button.append(svgElement("rect", { x: x + 0.5, y: y + 0.5, width: width - 1, height: KEY_HEIGHT - 1, rx: 8.5, fill: "#eaeaea", stroke: "#707070" }));
  const small = key.length > 1;
  button.append(svgElement("text", {
    x: x + width / 2, y: y + KEY_HEIGHT / 2 + 10, "text-anchor": "middle", fill: small ? "#6a6a6a" : "#263854",
    "font-size": small ? 24 : 30, "font-weight": small ? 600 : 700, "letter-spacing": "-0.05em"
  }, key));
  // Keep the caret in the search bar when keys are tapped.
  button.addEventListener("mousedown", event => event.preventDefault());
  activate(button, () => typeKey(key));
  keyboardPanel.append(button);
  if (!small) letterKeys.set(key, button);
}

// Letters in alphabetical order, six per row. Clear fills the rest of the
// last row after Y and Z.
ALPHABET.forEach((letter, index) => {
  const column = index % KEY_COLUMNS;
  const row = Math.floor(index / KEY_COLUMNS);
  keyboardKey(letter, letter, KEYS_X + column * KEY_STEP, KEYS_Y + row * KEY_ROW_STEP, KEY_WIDTH);
});
const lastRowY = KEYS_Y + Math.floor(ALPHABET.length / KEY_COLUMNS) * KEY_ROW_STEP;
keyboardKey("Clear", "Clear search", KEYS_X + 2 * KEY_STEP, lastRowY, KEYS_X + KEYS_WIDTH - (KEYS_X + 2 * KEY_STEP));
artwork.append(keyboardPanel);

setMode("today");
renderPin();
