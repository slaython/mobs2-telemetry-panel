"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vehicle_entity_1 = require("./entities/vehicle.entity");
const telemetry_entity_1 = require("./entities/telemetry.entity");
const vehicles_gateway_1 = require("./vehicles.gateway");
let VehiclesService = class VehiclesService {
    constructor(vr, tr, ws) {
        this.vr = vr;
        this.tr = tr;
        this.ws = ws;
    }
    async onModuleInit() {
        if (await this.vr.count() === 0) {
            await this.vr.save([{ plate: 'ABC-1234' }, { plate: 'XYZ-9876' }, { plate: 'MOB-0001' }]);
        }
        setInterval(() => this.simulateTick(), 5000);
    }
    jitter(base, delta = 0.001) {
        return base + (Math.random() * 2 - 1) * delta;
    }
    async simulateTick() {
        const vehicles = await this.vr.find();
        for (const v of vehicles) {
            const last = await this.tr.findOne({ where: { vehicle: { id: v.id } }, order: { timestamp: 'DESC' } });
            const lat = this.jitter(last?.lat ?? -8.05428);
            const lng = this.jitter(last?.lng ?? -34.8813);
            const speed = Math.max(0, (last?.speed ?? 30) + (Math.random() * 10 - 5));
            const fuel = Math.max(0, (last?.fuel ?? 80) - Math.random() * 0.3);
            const saved = await this.tr.save(this.tr.create({ vehicle: v, lat, lng, speed, fuel }));
            this.ws.emitTelemetry({ plate: v.plate, lat: saved.lat, lng: saved.lng, speed: saved.speed, fuel: saved.fuel, timestamp: saved.timestamp });
        }
    }
    async findAll(plate) {
        const qb = this.vr.createQueryBuilder('v')
            .leftJoin(qb => qb.from(telemetry_entity_1.Telemetry, 't')
            .select('DISTINCT ON (t."vehicleId") t."vehicleId", t.lat, t.lng, t.speed, t.fuel, t.timestamp')
            .orderBy('t."vehicleId" ASC, t.timestamp DESC'), 'lt', 'lt."vehicleId" = v.id')
            .addSelect(['v.id', 'v.plate']);
        const rows = await qb.getRawMany();
        const result = rows.map((r) => ({
            id: r.v_id, plate: r.v_plate,
            lat: Number(r.lt_lat), lng: Number(r.lt_lng),
            speed: Number(r.lt_speed), fuel: Number(r.lt_fuel),
            timestamp: r.lt_timestamp,
        }));
        return plate ? result.filter(i => i.plate.toLowerCase().includes(plate.toLowerCase())) : result;
    }
    async historyByPlate(plate) {
        const v = await this.vr.findOne({ where: { plate } });
        if (!v)
            return [];
        const hist = await this.tr.find({ where: { vehicle: { id: v.id } }, order: { timestamp: 'ASC' } });
        return hist.map(h => ({ lat: h.lat, lng: h.lng, timestamp: h.timestamp }));
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __param(1, (0, typeorm_1.InjectRepository)(telemetry_entity_1.Telemetry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        vehicles_gateway_1.VehiclesGateway])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map