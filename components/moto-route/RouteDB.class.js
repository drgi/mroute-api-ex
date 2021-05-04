const RouteModel = require('../../models/route');
const mongoose = require('mongoose');
class MongoTransport {
  constructor(mongoModel) {
    this.model = mongoModel;
  }
  isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }
  async findById(id) {
    return await this.model.findById(id); //Error???
  }
  async findRoutesByParams(params) {
    return await this.model
      .find(params)
      .lean()
      .select('nameTranslit name description avatar');
  }
  async findOneAndDelete(_id) {
    return this.isValidId(_id)
      ? await this.model.findOneAndDelete({ _id })
      : null;
  }
  async createRouteDraft(data) {
    const d = new this.model(data);
    await d.save({ validateBeforeSave: false });
    return d;
  }
  async findByIdAndUpdate(routeId, data) {
    const draft = await this.model.findById(routeId);
    Object.assign(draft, data);
    await draft.save({ validateBeforeSave: false });
    return draft;
  }
  async findByIdAndUpdateWithValidate(routeId, data) {
    const draft = await this.model.findById(routeId);
    Object.assign(draft, data);
    await draft.validate();
    draft.isDraft = false;
    await draft.save({ validateBeforeSave: false });
    return draft;
  }
  async checkRouteValid(routeId) {
    if (!this.isValidId(routeId)) {
      return null;
    }
    const route = await this.model
      .findById(routeId)
      .lean()
      .select('_id author');
    return route;
  }
  async addRouteImagesToRouteById(routeId, routeImages) {
    const route = await this.model.findById(routeId);
    route.routeImages = route.routeImages.concat(routeImages);
    await route.save({ validateBeforeSave: false });
    return route.routeImages;
  }
  async deleteImageFromRouteInDb(routeId, image) {
    const route = await this.model.findById(routeId);
    route.routeImages = route.routeImages.filter((i) => i.path !== image.path);
    await route.save({ validateBeforeSave: false });
    return route.routeImages;
  }
  async addImagesToRoutePointInDb(routeId, pointId, pointImg) {
    const route = await this.model.findById(routeId);
    let addedImages;
    route.points = route.points.map((p) => {
      if (p.id === pointId) {
        p.images = p.images.concat(pointImg);
        addedImages = p.images;
      }
      return p;
    });
    route.markModified('points');
    await route.save({ validateBeforeSave: false });
    return addedImages;
  }
  async deleteImageFromRoutePoint(routeId, pointId, fileForDelete) {
    const route = await this.model.findById(routeId);
    let addedImages;
    route.points = route.points.map((p) => {
      if (p.id === pointId) {
        p.images = p.images.filter((i) => i.path !== fileForDelete.path);
        addedImages = p.images;
      }
      return p;
    });
    route.markModified('points');
    await route.save({ validateBeforeSave: false });
    return addedImages;
  }
  async removePointFromDb(routeId, pointId) {
    const route = await this.model.findById(routeId);
    route.points = route.points.filter((p) => p.id !== pointId);
    route.markModified('points');
    await route.save({ validateBeforeSave: false });
    return route.points;
  }
  // Methods Api
}
const mongoTransport = new MongoTransport(RouteModel);

class MRouteDBApi {
  constructor(dbTransport) {
    this.dbApi = dbTransport;
  }
  async getRouteById(id) {
    return await this.dbApi.findById(id);
  }
  async deleteById(_id) {
    return await this.dbApi.findOneAndDelete(_id);
  }
  async getRoutesCardByParams(params) {
    return await this.dbApi.findRoutesByParams(params);
  }
  async createAndSaveRouteDraft(routeData) {
    return await this.dbApi.createRouteDraft(routeData);
  }
  async changeAndSaveRouteDraft(routeId, routeData) {
    return await this.dbApi.findByIdAndUpdate(routeId, routeData);
  }
  async changeAndPublicateRouteDraft(routeId, routeData) {
    return await this.dbApi.findByIdAndUpdateWithValidate(routeId, routeData);
  }
  async checkRoute(routeId, userId) {
    const route = await this.dbApi.checkRouteValid(routeId);
    if (route && userId === route.author.id) {
      return true;
    }
    return false;
  }
  async addRouteImagesToDb(routeId, routeImages) {
    return await this.dbApi.addRouteImagesToRouteById(routeId, routeImages);
  }
  async deleteImageFromRouteInDb(routeId, image) {
    return await this.dbApi.deleteImageFromRouteInDb(routeId, image);
  }
  async addImagesToRoutePointInDb(routeId, pointId, fileForDelete) {
    return await this.dbApi.addImagesToRoutePointInDb(
      routeId,
      pointId,
      fileForDelete
    );
  }
  async deleteImageFromPointInDb(routeId, pointId, fileForDelete) {
    return await this.dbApi.deleteImageFromRoutePoint(
      routeId,
      pointId,
      fileForDelete
    );
  }
  async removePointFromRouteInDb(routeId, pointId) {
    return await this.dbApi.removePointFromDb(routeId, pointId);
  }
  // Api Methods For works with Routes
}

const mRouteDBApi = new MRouteDBApi(mongoTransport);

module.exports = mRouteDBApi;
