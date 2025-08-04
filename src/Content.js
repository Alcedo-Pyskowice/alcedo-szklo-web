import { Routes, Route, Navigate } from 'react-router-dom';
import appInfo from './app-info';
import routes from './app-routes';
import { SideNavOuterToolbar as SideNavBarLayout } from './layouts';
import { Footer } from './components';

export default function Content() {
  return (
    <SideNavBarLayout title={localStorage.getItem('name')}>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}
        <Route
          path='*'
          element={<Navigate to='/orders' />}
        />
      </Routes>
      <Footer>
        Copyright © 1990-{new Date().getFullYear()} Alcedo ®
        <br />
        All trademarks or registered trademarks are property of their
        respective owners.
      </Footer>
    </SideNavBarLayout>
  );
}

