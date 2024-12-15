"use strict";
// import express from "express";
// export class App{
//     public app: express.Application;
//     public port: number = 3000;
//      public contexPath: string = '/api/v1';
//     constructor(appInit: { port: number; contexPath: string, modules: any; }){
//         this.app = express();
//         this.port = appInit.port;
//         this.contexPath = appInit.contexPath;
//       this.modules(appInit.modules);
//     }
//     private modules(modules: any) {
//         modules.forEach((module: any) => {
//             this.app.use(this.contexPath + module.path, module.router);
//             console.log(`Module ${module.path} initialized`);
//         });
//     }
//     public getApp(): express.Application{
//         return this.app;
//     }
//     public listen(){
//         this.app.listen(this.port, () => {
//             console.log(`App listening on the http://localhost:${this.port}`);
//         });
//     }
// }
