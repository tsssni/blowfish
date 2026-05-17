const sitePreference = document.documentElement.getAttribute("data-default-appearance");
const autoEnabled = document.documentElement.getAttribute("data-auto-appearance") === "true";
const switcherEnabled = {{ if .Site.Params.footer.showAppearanceSwitcher | default false }}true{{ else }}false{{ end }};

const getAppearance = () => {
  if (!switcherEnabled) return "auto";
  const stored = localStorage.getItem("appearance");
  return stored === "light" || stored === "dark" ? stored : "auto";
};

const resolveDark = (mode) => {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (autoEnabled && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return sitePreference === "dark";
};

const applyAppearance = (mode) => {
  document.documentElement.setAttribute("data-appearance", mode);
  document.documentElement.classList.toggle("dark", resolveDark(mode));
};

applyAppearance(getAppearance());

(() => {
  const style = document.createElement("style");
  style.textContent = `
    .appearance-icon { display: none; }
    .appearance-icon svg { height: 1em; width: 1em; }
    html[data-appearance="light"] .appearance-icon-light,
    html[data-appearance="dark"] .appearance-icon-dark,
    html[data-appearance="auto"] .appearance-icon-auto { display: flex; }
  `;
  document.head.appendChild(style);
})();

if (autoEnabled && window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getAppearance() === "auto") applyAppearance("auto");
  });
}

// Mermaid dark mode support
var updateMermaidTheme = () => {
  if (typeof mermaid !== 'undefined') {
    const isDark = document.documentElement.classList.contains("dark");

    const mermaids = document.querySelectorAll('pre.mermaid');
    mermaids.forEach(e => {
      if (e.getAttribute('data-processed')) {
        // Already rendered, clean the processed attributes
        e.removeAttribute('data-processed');
        // Replace the rendered HTML with the stored text
        e.innerHTML = e.getAttribute('data-graph');
      } else {
        // First time, store the text
        e.setAttribute('data-graph', e.textContent);
      }
    });

    if (isDark) {
      initMermaidDark();
      mermaid.run();
    } else {
      initMermaidLight();
      mermaid.run();
    }
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  updateMeta();
  this.updateLogo?.(getTargetAppearance());

  // Initialize mermaid theme on page load
  updateMermaidTheme();

  const cycle = (cur) => cur === "light" ? "dark" : cur === "dark" ? "auto" : "light";
  const onSwitch = () => {
    const next = cycle(getAppearance());
    if (next === "auto") {
      localStorage.removeItem("appearance");
    } else {
      localStorage.setItem("appearance", next);
    }
    applyAppearance(next);
    updateMeta();
    updateMermaidTheme();
    this.updateLogo?.(getTargetAppearance());
  };

  for (const id of ["appearance-switcher", "appearance-switcher-mobile"]) {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", onSwitch);
  }
});


var updateMeta = () => {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  var style = getComputedStyle(document.querySelector('body'));
  meta.setAttribute('content', style.backgroundColor);
}

{{ if and (.Site.Params.Logo) (.Site.Params.SecondaryLogo) }}
{{ $primaryLogo := resources.Get .Site.Params.Logo }}
{{ $secondaryLogo := resources.Get .Site.Params.SecondaryLogo }}
{{ if and ($primaryLogo) ($secondaryLogo) }}
var updateLogo = (targetAppearance) => {
  var imgElems = document.querySelectorAll("img.logo");
  var logoContainers = document.querySelectorAll("span.logo");

  targetLogoPath =
    targetAppearance == "{{ .Site.Params.DefaultAppearance }}" ?
    "{{ $primaryLogo.RelPermalink }}" : "{{ $secondaryLogo.RelPermalink }}"
  for (const elem of imgElems) {
    elem.setAttribute("src", targetLogoPath)
  }

  {{ if eq $primaryLogo.MediaType.SubType "svg" }}
  targetContent =
    targetAppearance == "{{ .Site.Params.DefaultAppearance }}" ?
    `{{ $primaryLogo.Content | safeHTML }}` : `{{ $secondaryLogo.Content | safeHTML }}`
  for (const container of logoContainers) {
    container.innerHTML = targetContent;
  }
  {{ end }}
}
{{ end }}
{{- end }}

var getTargetAppearance = () => {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

window.addEventListener("DOMContentLoaded", (event) => {
  const scroller = document.getElementById("top-scroller");
  const footer = document.getElementById("site-footer");
  if(scroller && footer && scroller.getBoundingClientRect().top > footer.getBoundingClientRect().top) {
    scroller.hidden = true;
  }
});
