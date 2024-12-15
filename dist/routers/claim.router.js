"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class ClaimRouter {
    constructor(claimController) {
        this.path = '/claims';
        this.getRouter = () => {
            return this.claimRouter;
        };
        this.getPath = () => { return this.path; };
        this.claimController = claimController;
        this.claimRouter = (0, express_1.Router)();
        //obtener todos los reclamos
        this.claimRouter.get('/', this.claimController.getAll);
        //obtener un reclamo por id
        this.claimRouter.get('/:id', this.claimController.getById);
        //crear un reclamo
        this.claimRouter.post('/', this.claimController.create);
        //actualizar un reclamo
        this.claimRouter.put('/:id', this.claimController.update);
        //eliminar un reclamo
        this.claimRouter.delete('/:id', this.claimController.delete);
    }
}
exports.default = ClaimRouter;
