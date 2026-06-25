# Zimmervermietung Buer

Statische Website fuer die Private Zimmervermietung Familie Schroedel in Gelsenkirchen-Buer.

## Dateien

- `index.html` - Seitenstruktur, Zimmerbereiche, Kontakt und Anfrageformular
- `styles.css` - modernes Schwarz-Weiss-Design mit blauen Akzenten
- `app.js` - Zimmerdaten, Kontaktinformationen, Anfrage-Mailto und lokaler Admin-Modus
- `assets/` - Ordner fuer echte Zimmerfotos

## Bilder einpflegen

Die Website erwartet spaeter diese Dateien:

```text
assets/hero-room.jpg
assets/zimmer-1.jpg
assets/zimmer-2.jpg
assets/zimmer-3.jpg
```

Solange die Bilder fehlen, zeigt die Seite saubere Platzhalter.

## Lokaler Start

```bash
python3 -m http.server 5173
```

Dann im Browser oeffnen:

```text
http://localhost:5173
```

## Admin-Ansicht

Der Admin-Bereich ist fuer normale Besucher nicht sichtbar. Lokal kann er fuer erste Tests so geoeffnet werden:

```text
http://localhost:5173/?admin=1#admin
```

Das ist noch kein echter Login. Fuer produktive Nutzung sollte spaeter ein geschuetzter Admin-Bereich mit Backend und Authentifizierung angebunden werden.
