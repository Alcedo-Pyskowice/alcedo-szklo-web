import { } from './pages';
import { withNavigationWatcher } from './contexts/navigation';
import Orders from './pages/orders/orders';
import Profile from './pages/profile/profile';

const routes = [
  {
    path: '/orders',
    element: Orders
  },
  {
    path: '/profile',
    element: Profile
  }
];

export default routes.map(route => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path)
  };
});
