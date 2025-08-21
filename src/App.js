import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.dark.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.dark.css';
import './themes/generated/theme.additional.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './dx-styles.scss';
import LoadPanel from 'devextreme-react/load-panel';
import { NavigationProvider } from './contexts/navigation';
import { AuthProvider, useAuth } from './contexts/auth';
import { useScreenSizeClass } from './utils/media-query';
import UnauthenticatedContent from './UnauthenticatedContent';
import { ThemeContext, useThemeContext } from "./theme";
import config from "devextreme/core/config";
import { loadMessages, locale } from 'devextreme/localization';
import plMessages from "devextreme/localization/messages/pl.json"
const key = process.env.REACT_APP_LICENSE_KEY
config({
  licenseKey: key
})

const Content = React.lazy(() => import("./Content"));

function App() {
  loadMessages(plMessages)
  // locale(navigator.language)
  locale('pl')

  const { user, loading } = useAuth();

  if (loading) {
    return <LoadPanel visible={true} />;
  }

  if (user) {
    return <Content />;
  }

  return <UnauthenticatedContent />;
}

export default function Root() {
  const screenSizeClass = useScreenSizeClass();
  const themeContext = useThemeContext();

  return (
    <Router>
      <ThemeContext.Provider value={themeContext}>
        <AuthProvider>
          <NavigationProvider>
            <div className={`app ${screenSizeClass}`}>
              <App />
            </div>
          </NavigationProvider>
        </AuthProvider>
      </ThemeContext.Provider>
    </Router>
  );
}
