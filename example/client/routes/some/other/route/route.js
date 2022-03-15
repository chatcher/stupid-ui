import { StupidBaseRouteView } from '/engine/routes/stupid-base-route-view.js';

export class RouteViewController extends StupidBaseRouteView {
	submit(data) {
		console.log(data);
	}
}
