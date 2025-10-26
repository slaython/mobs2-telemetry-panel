"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const vehicle_entity_1 = require("./vehicles/entities/vehicle.entity");
const telemetry_entity_1 = require("./vehicles/entities/telemetry.entity");
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [vehicle_entity_1.Vehicle, telemetry_entity_1.Telemetry],
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
});
//# sourceMappingURL=typeorm-datasource.js.map