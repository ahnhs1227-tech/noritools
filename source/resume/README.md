# Nori Resume source

Browser-only integration of the owner-provided 이력서 공방 source from https://resume-workshop-kr.lucylux.chatgpt.site/ (source version 6, commit 091d4de3cc0d26a1a40588e91052c991b1442f52).

From this folder run `npm ci` and `npm run build`. Generated JS, CSS and dependency notices are written to `assets/resume/`. The page entry is `tools/resume-maker/index.html`, UI translations are in `assets/i18n/resume-messages.js`, and the home tool registry is in `assets/nori/site.js`.

Form and photo data stay in browser memory. There is no form submission, analytics, local persistence or remote AI service. Browser print supports A4 and Save as PDF. The form is Korean; surrounding controls support Korean, English, Japanese and Simplified Chinese. The footer attribution is part of the printable document.

The mascot was generated for NORI using the existing Nori character as reference: job-seeking Nori holding resume documents and a briefcase, a small sage tie, transparent background.
