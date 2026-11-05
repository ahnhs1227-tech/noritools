# Static international pages

Korean HTML is the editable source. `/en/`, `/ja/` and `/zh-CN/` are generated copies, not separately maintained pages. Keep shared assets under `/assets/`.

1. Edit the Korean source and the human-authored dictionaries under `assets/i18n/`.
2. Install the existing resume build dependencies with `npm install` in `source/resume/` if needed.
3. From the site root, run `python3 scripts/build-locales.py --build`. An existing dependency directory may be supplied with `--resume-modules /absolute/path/to/node_modules`.
4. Run `python3 scripts/check-locales.py` and preview the affected tools, language switching, and mobile layouts.
5. Publish the changed Korean HTML, generated locale HTML, shared scripts, and `sitemap.xml` together.

The builder pre-renders the resume's empty form with the existing React code, translates authored page text, preserves input values and application scripts, resolves relative assets, and writes self-canonicals and reciprocal `hreflang` links. The sitemap lists all 152 canonical URLs. Existing `?lang=` links continue to work and canonicalize to the corresponding language path. Language switching happens in place to preserve user input.

No translation API, server, subscription or new hosting service is used. This improves discovery and language matching; it cannot promise indexing, search rank or traffic. Guide screenshots currently show the Korean UI and their translated captions explicitly identify that example.
