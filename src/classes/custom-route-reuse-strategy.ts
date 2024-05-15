import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';
import { tabRoutes } from '../app/app.routes';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private readonly detachedRouteHandles = new Map<
    string,
    DetachedRouteHandle
  >();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return tabRoutes.some(
      (tabRoute) =>
        tabRoute.path !== 'maze' && tabRoute.path === route.routeConfig?.path
    );
  }

  store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null
  ): void {
    const path = route.routeConfig?.path;

    if (path != null && handle != null) {
      this.detachedRouteHandles.set(path, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;

    return path != null && this.detachedRouteHandles.get(path) != null;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = route.routeConfig?.path;

    if (path != null) {
      return this.detachedRouteHandles.get(path) ?? null;
    }

    return null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
