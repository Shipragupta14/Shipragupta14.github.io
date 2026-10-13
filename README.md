# Shipra Gupta · interactive cover letter

A single-page site to share instead of a cover letter. It's plain HTML, CSS and JavaScript, with no build step and no dependencies.

## Personalize per application

Add query parameters to the URL:

```
https://<your-site>/?company=Contoso&role=Senior%20Backend%20Engineer&name=Priya
```

| Param | Short | Effect |
|---|---|---|
| `company` | `c` | Greeting, "Prepared for …" badge, letter, trace span, invite request and email subject |
| `role` | `r` | Role in the hero, letter, request body and email (default: *Senior Backend Engineer*) |
| `name` | `n` | Recruiter or hiring manager first name ("Hi Priya", "Dear Priya") |

Open `link-builder.html` to generate these links with a form. That page isn't linked from the site and is marked `noindex`.

## Run locally

```powershell
cd C:\Users\shipgupta\shipra-portfolio
python -m http.server 8080
# open http://localhost:8080/?company=Contoso
```

## Publish (GitHub Pages, free)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\shipgupta\shipra-portfolio\deploy.ps1
```

The first run opens a browser so you can sign in with your **personal** GitHub account (Shipragupta14). It then creates the `Shipragupta14.github.io` repo, pushes the site, turns on Pages and prints the live URL: **https://shipragupta14.github.io/**. Run it again after any edit to republish.

The script uses its own sign-in profile (`%USERPROFILE%\.gh-personal`), so your Microsoft work GitHub login is never used or changed. Commits use your GitHub no-reply email.

## Editing

- **Content:** `index.html`, plus the trace spans (`SPANS`), skills (`S`) and demo copy in `main.js`.
- **Email / career start / donut data:** `CONFIG` at the top of `main.js`.
- **Résumé:** replace `assets/Shipra_Gupta_Resume.pdf`.
- **Cache-busting:** after editing CSS or JS, bump the `?v=` number in `index.html`.
- **Phone number:** shown in the contact grid in `index.html`. Delete that `<a class="contact">` block if you'd rather not publish it.

## Extras

- Respects `prefers-reduced-motion`. Animations pause when off-screen.
- Typing `hire` anywhere on the page triggers confetti. Engineers who open DevTools get a console note.
