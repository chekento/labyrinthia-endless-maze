# Datenschutz, KI- & Drittanbietertransparenz — Labyrinthia

**Stand:** 1. Oktober 2026  
**App:** Labyrinthia 2.4.3 Pre-Alpha (`cloud.kosch.labyrinthia`)  
**Projekt:** https://github.com/chekento/labyrinthia-endless-maze  
**Kontakt / Anbieterinformationen:** https://kosch.cloud

## 1. Kurzfassung

Die Android-Version von Labyrinthia ist als lokale, offline-orientierte Spiele-App aufgebaut.

- Kein Benutzerkonto.
- Keine Werbung.
- Kein Analytics-/Tracking-SDK.
- Keine Android-`INTERNET`-Berechtigung.
- Kein Standortzugriff.
- Kein Kontakt-, Kamera- oder Mikrofonzugriff.
- Fortschritt, Ränge, Achievements und Einstellungen werden lokal gespeichert.
- Der Beschleunigungssensor wird nur verwendet, wenn die Bewegungssteuerung aktiviert ist.

## 2. Android-Berechtigungen und Sensoren

Die aktuelle App deklariert:

- `VIBRATE` — optionale haptische Rückmeldung.
- Beschleunigungssensor als optionale Hardwarefunktion — für die Neigungssteuerung.

Der Beschleunigungssensor benötigt keine Standortberechtigung. Sensordaten werden zur lokalen Bewegungssteuerung verwendet und nicht an einen Labyrinthia-Server übertragen.

## 3. KI-Transparenz

### Keine KI-/ML-Laufzeit im Spiel

Labyrinthia verwendet in der aktuellen Version **keine generative KI, kein LLM und kein Machine-Learning-Modell** für das Gameplay.

Folgende Funktionen sind klassische lokale Algorithmen und **keine KI**:

- prozedurale Maze-Generierung,
- Seed-/Levelerzeugung,
- Physik und Beschleunigung,
- Kollisionslogik,
- Fallenplatzierung,
- Savepoints,
- XP-, Rang- und Achievement-Systeme,
- Minimap- und Pfadlogik.

Es werden keine Spielereingaben oder Sensordaten an ChatGPT/OpenAI oder andere KI-Dienste gesendet.

## 4. Lokale Speicherung

Je nach Nutzung speichert das Spiel lokal:

- Level-/Fortschrittsstand,
- XP und Rang,
- Achievements,
- ausgewähltes Kugelprofil,
- Steuerungs- und Sensoroptionen,
- Audio-/UI-Einstellungen,
- weitere Spielfortschrittswerte.

Die Daten liegen im lokalen WebView-/App-Speicher. Es gibt kein Cloudkonto und keine serverseitige Spielfortschrittsdatenbank.

Lokale Daten können durch Löschen der App-Daten oder Deinstallation entfernt werden. Eine Deinstallation kann den Spielfortschritt dauerhaft löschen.

## 5. Drittanbieter-Komponenten und Tools

### App-Laufzeit

- **Android System WebView** — rendert die lokal gebündelte HTML/CSS/JavaScript-Spieloberfläche.
- **AndroidX WebKit / WebViewAssetLoader** — stellt die lokalen Spielressourcen sicher im WebView bereit.
- **Android Sensor APIs** — optionaler Beschleunigungssensor für Tilt-Steuerung.
- **Android Vibration API** — optionale Haptik.

### Build und Distribution

- **Gradle**
- **Android SDK**
- **JDK 17**
- **GitHub / GitHub Actions / GitHub Releases**

Diese Build-Dienste und Tools sind keine Laufzeit-Tracker in der Android-App.

## 6. Netzwerk und Web-Version

Die Android-App besitzt derzeit keine `INTERNET`-Berechtigung und benötigt für das Kernspiel keinen Netzverkehr.

Separat wird eine Browser-Version über **https://maze.on.websim.com** verlinkt. Wer diese Web-Version öffnet, stellt eine Verbindung zum jeweiligen Hosting-/Browserdienst her. Dort können technisch notwendige Verbindungsdaten wie IP-Adresse, Zeitpunkt, User-Agent und Cookies/Local-Storage nach den Regeln des Hosters verarbeitet werden. Diese Browser-Version ist datenschutztechnisch von der offline-orientierten Android-App zu unterscheiden.

Externe Links zu GitHub oder kosch.cloud werden nur nach Nutzeraktion im Browser geöffnet.

## 7. Beschleunigungssensor

Bei aktivierter Bewegungssteuerung werden Neigungswerte verwendet, um die virtuelle Kugel zu beschleunigen. Die Werte dienen nicht zur Standortbestimmung, biometrischen Erkennung oder Erstellung eines Bewegungsprofils außerhalb des Spiels.

## 8. Zertifikate, Signierung und Prüfsummen

Die aktuelle Pre-Alpha-APK wird als **Debug-/Test-Build** verteilt. Sie ist nicht mit einer finalen Play-Store-Produktionsidentität signiert.

Die Android-APK-Signatur bestätigt die technische Herkunft eines Builds, ist aber keine externe Sicherheits- oder Datenschutz-Zertifizierung. Veröffentlichte SHA-256-Prüfsummen dienen der Dateiintegritätsprüfung.

Labyrinthia installiert keine eigene Root-CA und verlangt keine Benutzerzertifikate.

## 9. Keine Werbung, kein Analytics, keine Accounts

Die aktuelle Android-Version enthält:

- kein Werbe-SDK,
- kein Analytics-SDK,
- keinen Tracking-Pixel,
- kein Login,
- keine Social-Login-Funktion,
- keinen Remote-KI-Dienst.

## 10. Änderungen

Sollten spätere Versionen Online-Multiplayer, Cloud-Saves, Accounts, Telemetrie, KI-Funktionen oder neue Berechtigungen erhalten, muss diese Seite vor Veröffentlichung entsprechend erweitert werden.

---

**Repository:** https://github.com/chekento/labyrinthia-endless-maze  
**Anbieter / Kontakt:** https://kosch.cloud
