import React, { useCallback, useMemo, useState } from 'react';

const themes = ['light', 'dark'];
const themeClassNamePrefix = 'dx-swatch-';
if (!localStorage.getItem("app-theme")) {
  localStorage.setItem("app-theme", "light")
}
const localTheme = localStorage.getItem("app-theme") == "dark" ? "light" : "dark"
let currentTheme = getNextTheme(localTheme);

function getNextTheme(theme = '') {
  return themes[themes.indexOf(theme) + 1] || themes[0];
}

function getCurrentTheme() {
  if (localStorage.getItem("app-theme")) {
    return localStorage.getItem("app-theme")
  }
  return currentTheme;
}

function toggleTheme(prevTheme) {
  const isCurrentThemeDark = prevTheme === 'dark';
  const newTheme = getNextTheme(prevTheme);

  document.body.classList.replace(
    themeClassNamePrefix + prevTheme,
    themeClassNamePrefix + newTheme
  );

  const additionalClassNamePrefix = themeClassNamePrefix + 'additional';
  const additionalClassNamePostfix = isCurrentThemeDark ? '-' + prevTheme : '';
  const additionalClassName = `${additionalClassNamePrefix}${additionalClassNamePostfix}`

  document.body
    .querySelector(`.${additionalClassName}`)?.classList
    .replace(additionalClassName, additionalClassNamePrefix + (isCurrentThemeDark ? '' : '-dark'));

  currentTheme = newTheme;
  localStorage.setItem("app-theme", newTheme)

  return newTheme;
}

export function useThemeContext() {
  const [theme, setTheme] = useState(getCurrentTheme());
  const switchTheme = useCallback(() => setTheme((currentTheme) => toggleTheme(currentTheme)), []);
  const isDark = useCallback(() => {
    return currentTheme === 'dark';
  }, []);

  if (!document.body.className.includes(themeClassNamePrefix)) {
    document.body.classList.add(themeClassNamePrefix + theme);
  }

  return useMemo(() => ({ theme, switchTheme, isDark }), [theme, switchTheme, isDark]);
}

export const ThemeContext = React.createContext(null);
