# House of Nyx — Character Archive

A responsive Gothic Royal Archive × Romantic Dark Academia website, ready for **free GitHub Pages hosting**. No npm, build commands, or paid services required.

## Publish to GitHub Pages (beginner friendly)

1. Sign in at https://github.com and click **+ → New repository**.
2. Name it `houseofnyx`, select **Public**, and click **Create repository**.
3. Choose **uploading an existing file** (or **Add file → Upload files**).
4. Upload `index.html`, `styles.css`, `app.js`, `data.js`, `README.md` and the `assets` folder (if it contains images). **Upload the files themselves, not the ZIP.** Keep all four main website files in the repository's top level.
5. Click **Commit changes**.
6. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**; select `main` and `/ (root)` and click **Save**.
7. After GitHub finishes publishing (usually a few minutes), visit `https://nyxandnott.github.io/houseofnyx/`.

## Preview on your computer

Double-click `index.html` to open it in your browser. The gallery, filters, profiles, and updates work without a server.

## Add your own bot

1. Open `data.js` on GitHub and click the pencil **Edit** icon.
2. Copy an existing entry inside `window.NYX_CHARACTERS`, paste it after another entry (separated by a comma), and change the values.
3. Each `id` must be unique, lowercase and hyphenated (e.g. `my-new-bot`).
4. Set `url` to your full DreamJourneyAI bot link (e.g. `https://...`). Until you do, the profile shows "Character link coming soon."
5. Add a portrait image to the `assets` folder via GitHub's **Add file → Upload files**, then set `image: 'assets/my-bot.jpg'` in the entry. Use your own art and compress large images for faster loading. Portraits look best around 3:4 or 4:5.
6. Click **Commit changes**. GitHub Pages will publish the update automatically.

## Add a news/update entry

In `data.js`, add an object to `window.NYX_UPDATES`:

```js
{date:'NOV 15, 2026',category:'NEW ARRIVAL',title:'A new soul enters',text:'Meet our newest character.'}
```

Put the newest entry first. Commit the file.

## Customize branding

- Change homepage copy in `index.html`.
- Change colors at the beginning of `styles.css` (`:root` variables).
- The homepage currently uses an original CSS gradient and ornamental typography. To add your own banner, upload it to `assets/` and modify `.hero` in `styles.css` to include `background-image: linear-gradient(...), url('assets/banner.jpg'); background-size: cover; background-position: center;`.
- All example character entries are **starter content** and should be reviewed and replaced with your preferred text, images, and links.

## Technical notes

- Static HTML/CSS/vanilla JS; no build process or dependencies except optional Google Fonts.
- Responsive layout, searchable/filterable gallery, accessible native profile dialogs, updates section, mobile navigation, deep-linkable character profiles.
- The `esc()` helper escapes user-visible text from `data.js`. Only add links/images you trust.
- GitHub Pages is public hosting: do not put private information or API keys in the files.
