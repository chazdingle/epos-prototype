# Krispies EPOS — your XD sign-on screen

## Put this into your own project

1. Make a backup of your current project folder.
2. Copy `index.html`, `style.css`, `app.js` and the entire `fonts` folder into your EPOS Prototype folder.
3. Replace the earlier starter HTML and CSS files. Keep all these files together.
4. Open `index.html` in Chrome or Safari. No installation, server or internet connection is needed.

The original XD SVG artwork is embedded in `index.html`, including your Krispies logo. It is the actual artwork, not a screenshot background. Text, shapes and buttons remain individual elements. Coordinates, colours, outlines, corner radii, typography, initials and keypad order are taken from your two exports.

The screen has the original 1024 × 768 proportions. It scales uniformly to fit the browser window rather than rearranging your design. Wider or taller windows leave space around it.

## What works

- Select any of your six staff. Exactly one card is highlighted; the PIN panel shows that person's name.
- Use the touchscreen keypad or physical number keys to enter up to four digits.
- C clears the PIN; 00 enters two zeroes, up to the four-digit limit.
- Physical Backspace removes one digit; Escape clears the PIN.
- Selecting another person clears the PIN.
- Today shows the sample rota list in your original order.
- All Staff shows a search bar and a scrolling A–Z list of everyone, grouped under letter headings, in the same card style.
- The A–Z strip beside the list jumps to a letter. Letters with no matching staff are greyed out.
- Search filters immediately by the start of a name, ignoring case and surrounding spaces.
- In All Staff, an on-screen A–Z keyboard (letters in alphabetical order, plus Clear) fills the right-hand panel until a name is picked, then the PIN pad replaces it. The tablet's own keyboard is kept closed; a physical keyboard still types into the search bar.
- The keyboard is a one-letter quick search. Tapping a letter shows only the names starting with it, highlights that letter and greys out all the others. Tapping the letter again, or Clear, brings the other letters back.
- Letters no name starts with are greyed out and can't be tapped (Q, U and X in the example names).
- Tapping the search bar again, or typing, clears the selected person and any PIN digits and brings the keyboard back.
- Signing out returns to a fresh Today list.
- Tab, Enter and Space can operate the buttons.
- Sign on accepts any four digits, flashes a welcome message with the staff member's name for 0.3 seconds, then moves to a blank homepage. Tapping or pressing any key skips it.
- The homepage keeps the original navy header and Krispies logo, and shows the signed-on name and a Sign out button. Sign out returns to the sign-on screen.

All Staff's search bar, A–Z list, jump strip and on-screen keyboard were added because they were requested; they are not present in the supplied SVGs. The Today and selected-person screens preserve those exports.

## Edit staff once

Open `app.js`. The `STAFF` array at the top controls every name card. Change the `name`, `initials` and `today` values there. Each `id` must be unique.

```js
{ id: "charlie", name: "Charlie", initials: "CB", today: true }
```

`today: true` includes someone in Today. `today: false` includes them only in All Staff. These are manual sample values, not connected to a live rota. The list includes example names for show; delete any you don't need. If more than six staff are on Today, page controls appear below the cards.

The optional `initialsX`, `initialsY` and `initialsSize` properties preserve the individual text positioning from your XD export. You can leave them out for new names.

## Where the three files fit

- `index.html`: your original exported SVG with interaction hooks.
- `style.css`: bundled font loading, proportional screen sizing and focus/search styling. The SVG itself owns the original screen appearance.
- `app.js`: the staff list and shared behaviour. You do not need individual states for each staff member.

## Connect Sales Mode later

The Sign on button dispatches `epos:signon` with `staffId` and `name`. No PIN is included. Add an event listener and call `event.preventDefault()` to replace the welcome message and blank homepage with your next screen.

The welcome and home screens are the `session-screens` SVG in `index.html`. It draws over the grey body only, so the original header artwork stays visible. Change `WELCOME_MS` in `app.js` to change how long the welcome shows.

## Demo limits

This is a local visual prototype, not secure authentication. Any four digits are accepted. There is no database, real PIN verification or staff permission enforcement. PIN values remain only in memory and are cleared when staff change or sign-on succeeds. No data is sent anywhere.

Montserrat SemiBold and Bold are included for offline use, with their SIL Open Font License in `fonts/OFL.txt`.

## Verification

The default and Charlie-selected artwork rendered identically to the provided SVG exports at 1024 × 768 using the same renderer and Montserrat fonts. DOM interaction checks cover all six staff selections, one active highlight, keypad actions, PIN limits and reset, keyboard controls, tabs, case-insensitive prefix search, no-match results, and the sign-on event. Browser font rasterisation may differ slightly between operating systems.
