{{ $st := .Site.Params.shikiTheme }}
{{ $cdn := .Site.Params.shikiCdn | default "https://esm.sh/shiki@1" }}

{{ $lightName := "" }}
{{ $darkName := "" }}
{{ $soloName := "" }}
{{ if reflect.IsMap $st }}
  {{ $lightName = $st.light }}
  {{ $darkName = $st.dark }}
{{ else }}
  {{ $soloName = $st }}
{{ end }}

{{ $dual := and $lightName $darkName }}
{{ $lightRes := cond (ne $lightName "") (resources.Get (printf "shiki/%s.json" $lightName)) false }}
{{ $darkRes := cond (ne $darkName "") (resources.Get (printf "shiki/%s.json" $darkName)) false }}
{{ $soloRes := cond (ne $soloName "") (resources.Get (printf "shiki/%s.json" $soloName)) false }}

import { createHighlighter } from "{{ $cdn }}";

{{ if $dual }}
{{ if $lightRes }}
const lightTheme = {{ $lightRes.Content | safeJS }};
lightTheme.name = {{ $lightName | jsonify }};
{{ else }}
const lightTheme = {{ $lightName | jsonify }};
{{ end }}
{{ if $darkRes }}
const darkTheme = {{ $darkRes.Content | safeJS }};
darkTheme.name = {{ $darkName | jsonify }};
{{ else }}
const darkTheme = {{ $darkName | jsonify }};
{{ end }}
const themes = [lightTheme, darkTheme];
const lightName = {{ $lightName | jsonify }};
const darkName = {{ $darkName | jsonify }};
const dual = true;
{{ else }}
{{ if $soloRes }}
const soloTheme = {{ $soloRes.Content | safeJS }};
soloTheme.name = {{ $soloName | jsonify }};
const themes = [soloTheme];
{{ else }}
const themes = [{{ $soloName | jsonify }}];
{{ end }}
const soloName = {{ $soloName | jsonify }};
const dual = false;
{{ end }}

const customLangs = [
{{- range resources.Match "shiki/langs/*.json" }}
  {{ .Content | safeJS }},
{{- end }}
];

const highlighterPromise = createHighlighter({
  themes,
  langs: customLangs,
});

if (dual) {
  const style = document.createElement("style");
  style.textContent = `
    html.dark .shiki,
    html.dark .shiki span {
      color: var(--shiki-dark) !important;
      background-color: var(--shiki-dark-bg) !important;
    }
  `;
  document.head.appendChild(style);
}

const extractLang = (code) => {
  const m = code.className.match(/(?:^|\s)language-([\w+#.-]+)/i);
  return m ? m[1].toLowerCase() : null;
};

const highlight = async () => {
  const hl = await highlighterPromise;
  const loaded = new Set(hl.getLoadedLanguages());
  for (const code of document.querySelectorAll("pre > code[class*='language-']")) {
    const pre = code.parentElement;
    if (pre.dataset.shikiDone) continue;
    const lang = extractLang(code);
    if (!lang) continue;
    if (!loaded.has(lang)) {
      try {
        await hl.loadLanguage(lang);
        loaded.add(lang);
      } catch {
        continue;
      }
    }
    const opts = dual
      ? { lang, themes: { light: lightName, dark: darkName } }
      : { lang, theme: soloName };
    const html = hl.codeToHtml(code.textContent, opts);
    pre.outerHTML = html;
  }
};

window.addEventListener("DOMContentLoaded", highlight);
