# QuizCardGen

A modern, dark-theme 1:1 square quiz card and 8-slide LinkedIn Document Carousel generator. Built entirely with client-side vanilla web technologies for zero-dependency local use and instant GitHub Pages deployment.

---

## ⚡ Quick Paste: Format & Slide Mapping Direction

When you copy and paste your multiple-choice questions into the **Quick Paste** modal (`⚡ Quick Paste`), QuizCardGen intelligently parses your text into dynamic slides.

### Example Paste Format

```text
A streaming ingestion pipeline receives web clickstream events containing occasional malformed JSON payloads. According to Medallion architecture principles, which layer should store this raw, unaltered dataset complete with its data quality flaws, and which subsequent layer is tasked with storing cleansed and enriched events?

A.
The Landing layer stores raw data; the Gold layer stores cleansed events directly.
The Gold layer is reserved for business-level aggregates and star-schema models rather than intermediate cleansed and conformed datasets.

B.
The Bronze layer stores the raw unaltered data; the Silver layer stores cleansed and enriched events.
That's right!
The Bronze layer retains raw historical data in its original form regardless of quality errors, whereas the Silver layer handles data cleansing, filtering, and contextual enrichment.

C.
The Bronze layer stores cleansed events; the Silver layer stores aggregated business data marts.
The Bronze layer does not clean or transform incoming records, as doing so would erase the original source audit trail.

D.
The Silver layer stores raw unaltered data; the Gold layer stores cleansed events alongside aggregates.
Storing raw, unvalidated data directly in the Silver layer violates the Medallion progression, which relies on Bronze to isolate original source payloads.
```

---

### 🗺️ Dynamic vs. Template Mapping Architecture

| Carousel Slide | Field | Mapping Type | Description |
| :--- | :--- | :--- | :--- |
| **Slide 1 (Cover / Hook)** | Title, Subtitle, Topic Tag, Author | **Template** | Hook card introducing the quiz topic (e.g., *"How well do you know [Topic]?"*). Editable in Settings Drawer or click-to-type. |
| **Slide 2 (Scenario)** | Scenario Title & Pro-Tip Hint | **Template** | Header (e.g., *"Understanding Medallion Layers"*) & hint box. Editable in Settings Drawer. |
| **Slide 2 (Scenario)** | Scenario Body Text | **Dynamic** | Auto-populated from the pasted question before `A.`. |
| **Slides 3–6 (Options A–D)** | Option Statement Text | **Dynamic** | Auto-populated from each option statement under `A.`, `B.`, `C.`, `D.`. Also updates the 4-Block Grid view. |
| **Slides 3–6 (Options A–D)** | Question Header | **Dynamic** | Displays the parsed question across each option card. |
| **Slide 7 (Engagement)** | Title & Comment Prompt | **Template** | Call-to-action slide (e.g., *"Ready for the answer? Drop your choice in comments"*). Editable in Settings Drawer. |
| **Slide 8 (Hero Card)** | Correct Winning Option & Explanation | **Dynamic** | Auto-detected from affirmative phrases (e.g., *"That's right!"*, *"Correct"*, *"✓"*), or selected via Option A–D buttons. |
| **Slide 8 (Traps Breakdown)**| Why the other 3 fail | **Dynamic** | The other 3 options are automatically grouped with `[A ✗]`, `[C ✗]`, etc. badges and their failure explanations. |
| **Slide 8 (Footer)** | Closing Callout CTA | **Template** | Retention CTA (e.g., *"🔖 Save this post for your next interview & Follow for more"*). Editable in Settings Drawer. |

---

## 🎯 Universal Option Flexibility (A–D)

- Any option (A, B, C, or D) can be set as the correct winning answer.
- **Dynamic Sidebar**: Selecting Option A, B, C, or D immediately updates the Settings Drawer:
  - The winning option is labeled: `(Correct Answer ✓)` with green accent styling.
  - The distractors are labeled: `(Why it fails ✗)`.
- **Slide 8 Split**: The winning option automatically becomes the **Hero Block**, while the remaining 3 options populate the **Traps Breakdown**.

---

## 🚀 Running Locally

Two 1-click executable scripts are included:

```bash
# Start local server (opens on http://localhost:8088)
./start_server.sh

# Stop local server
./stop_server.sh
```

Or open `index.html` directly in your browser (all libraries are bundled locally).

---

## 🌐 Deploying to GitHub Pages (`github.io`)

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/quizcardgenerator.git
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch** (`main` branch, `/ (root)` folder).
4. Your application will be live at:
   ```
   https://<YOUR_USERNAME>.github.io/quizcardgenerator/
   ```

---

## 🛠️ Tech Stack
- **Pure Client-Side**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Libraries**:
  - `html2canvas.min.js`: 1080×1080px lossless PNG rendering.
  - `jspdf.umd.min.js`: Multi-page 1080×1080px LinkedIn Document PDF generation with exact color matching.
