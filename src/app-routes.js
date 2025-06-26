import { } from './pages';
import { withNavigationWatcher } from './contexts/navigation';
import Claims from './pages/claims/claims';
import Orders from './pages/orders/orders';
import Racks from './pages/racks/racks';

const routes = [
  {
    path: '/orders',
    element: Orders
  },
  {
    path: '/claims',
    element: Claims
  }
];

export default routes.map(route => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path)
  };
});
