const {
  deleteRouteDir,
  makeDirForNewRoute,
  addImagesToRoute,
  deleteImageFile,
  writeImagesToPoint,
  deleteImageFromPoint,
  deletePointDirectory,
} = require('./route.fs');
const mRouteDBApi = require('./RouteDB.class');

class MRoute {
  constructor(request = null) {
    if (!request) {
      throw new Error('Не передан, request');
    }
    this.dbApi = mRouteDBApi;
    this.route = null;
    this.request = request;
  }
  async getRoutesCardByParams() {
    const routesParams = this.request.getSearchParams();
    const routes = await this.dbApi.getRoutesCardByParams(routesParams);
    return routes;
  }
  async getRouteDataFromDbById() {
    const { routeId } = this.request.getParams();
    const route = await this.dbApi.getRouteById(routeId);
    return route;
  }
  async deleteRouteById() {
    const { routeId } = this.request.getParams();
    const route = await this.dbApi.deleteById(routeId);
    await deleteRouteDir(routeId);
    return route;
  }
  async createRouteDraft() {
    const routeDraftData = this.request.getRouteDraftData();
    const routeDraft = await this.dbApi.createAndSaveRouteDraft(routeDraftData);
    if (routeDraft) {
      const { _id } = routeDraft;
      await makeDirForNewRoute(_id.toString());
    }
    return routeDraft;
  }
  async addChangesToRouteDraft() {
    const routeDraftData = this.request.getRouteDraftData();
    const { routeId } = this.request.getParams();
    const { isDraft } = this.request.getQuery();
    let routeDraft;
    if (isDraft === 'false') {
      routeDraft = await this.dbApi.changeAndPublicateRouteDraft(
        routeId,
        routeDraftData
      );
    } else {
      routeDraft = await this.dbApi.changeAndSaveRouteDraft(
        routeId,
        routeDraftData
      );
    }
    return routeDraft;
  }
  async addImagesToRoute() {
    const userId = this.request.getUserId();
    const routeId = this.request.getRouteId();
    const imageFiles = this.request.getRouteImageFiles();
    const checkRoute = this.dbApi.checkRoute(routeId, userId);
    if (!checkRoute) {
      throw new Error('Маршрут не создан или вы не являетесь автором:(');
    }
    const routeImages = await addImagesToRoute(routeId, imageFiles);
    console.log('RouteImages', routeImages);
    return await this.dbApi.addRouteImagesToDb(routeId, routeImages);
  }
  async deleteImageFromRoute() {
    const userId = this.request.getUserId();
    const routeId = this.request.getRouteId();
    const fileForDelete = this.request.getFileForDelete();
    const checkRoute = this.dbApi.checkRoute(routeId, userId);
    if (!checkRoute) {
      throw new Error('Маршрут не создан или вы не являетесь автором:(');
    }
    await deleteImageFile(routeId, fileForDelete);
    return await this.dbApi.deleteImageFromRouteInDb(routeId, fileForDelete);
  }
  async addImagesToRoutePoint() {
    const userId = this.request.getUserId();
    const routeId = this.request.getRouteId();
    const pointId = this.request.getPointId();
    const imageFiles = this.request.getPointImages();
    const checkRoute = this.dbApi.checkRoute(routeId, userId);
    if (!checkRoute) {
      throw new Error('Маршрут не создан или вы не являетесь автором:(');
    }
    const pointImages = await writeImagesToPoint(routeId, pointId, imageFiles);
    return await this.dbApi.addImagesToRoutePointInDb(
      routeId,
      pointId,
      pointImages
    );
  }
  async removeImageFromRoutePoint() {
    const userId = this.request.getUserId();
    const routeId = this.request.getRouteId();
    const pointId = this.request.getPointId();
    const fileForDelete = this.request.getFileForDelete();
    const checkRoute = this.dbApi.checkRoute(routeId, userId);
    if (!checkRoute) {
      throw new Error('Маршрут не создан или вы не являетесь автором:(');
    }
    await deleteImageFromPoint(routeId, pointId, fileForDelete);
    return await this.dbApi.deleteImageFromPointInDb(
      routeId,
      pointId,
      fileForDelete
    );
  }
  async removePointFromRoute() {
    const userId = this.request.getUserId();
    const routeId = this.request.getRouteId();
    const pointId = this.request.getPointId();
    const checkRoute = this.dbApi.checkRoute(routeId, userId);
    if (!checkRoute) {
      throw new Error('Маршрут не создан или вы не являетесь автором:(');
    }
    await deletePointDirectory(routeId, pointId);
    return await this.dbApi.removePointFromRouteInDb(routeId, pointId);
  }
}
//const mRoute = new MRoute();

module.exports = MRoute;
