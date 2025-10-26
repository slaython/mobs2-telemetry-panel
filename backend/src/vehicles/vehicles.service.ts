import { Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Telemetry } from './entities/telemetry.entity';
import { VehiclesGateway } from './vehicles.gateway';
import fetch from 'node-fetch';

@Injectable()
export class VehiclesService implements OnModuleInit {
  constructor(
    @InjectRepository(Vehicle) private vr: Repository<Vehicle>,
    @InjectRepository(Telemetry) private tr: Repository<Telemetry>,
    private ws: VehiclesGateway,
  ) {}

  private liveState = new Map<
    string,
    { lat: number; lng: number; fuel: number; heading: number }
  >();

  async onModuleInit() {
    if (await this.vr.count() === 0) {
      await this.vr.save([
        { plate: 'ABC-1234' },
        { plate: 'XYZ-9876' },
        { plate: 'MOB-0001' },
      ]);
    }

    setInterval(() => this.simulateTick(), 5000);
  }

  private async getRawHistoryPoints(plate: string, limit = 100) {
    const v = await this.vr.findOne({ where: { plate } });
    if (!v) return [];

    const hist = await this.tr.find({
      where: { vehicle: { id: v.id } },
      order: { timestamp: 'DESC' },
      take: limit,
    });

    return hist.reverse().map((h) => ({
      lat: h.lat,
      lng: h.lng,
      timestamp: h.timestamp,
    }));
  }

  async getSnappedHistory(plate: string) {
    const rawPoints = await this.getRawHistoryPoints(plate, 100);
    if (rawPoints.length === 0) {
      return [];
    }

    const pathParam = rawPoints
      .map((p) => `${p.lat},${p.lng}`)
      .join('|')

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new HttpException(
        'Missing GOOGLE_MAPS_API_KEY on server',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const url = `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(
      pathParam,
    )}&interpolate=true&key=${apiKey}`;

    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      throw new HttpException(
        `SnapToRoads request failed: ${text}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data: {
      snappedPoints?: Array<{
        location: { latitude: number; longitude: number };
        placeId?: string;
      }>;
    } = await res.json();

    if (!data.snappedPoints || !Array.isArray(data.snappedPoints)) {
      return rawPoints;
    }

    const snapped = data.snappedPoints.map((pt) => ({
      lat: pt.location.latitude,
      lng: pt.location.longitude,
    }));

    return snapped;
  }

  async simulateTick() {
    const vehicles = await this.vr.find();

    for (const v of vehicles) {
      const last = await this.tr.findOne({
        where: { vehicle: { id: v.id } },
        order: { timestamp: 'DESC' },
      });

      let st = this.liveState.get(v.id);
      if (!st) {
        st = {
          lat: last?.lat ?? -8.05428,
          lng: last?.lng ?? -34.8813,
          fuel: last?.fuel ?? 80,
          heading: Math.random() * 360,
        };
        this.liveState.set(v.id, st);
      } else {
        if (last && !('synced' in (st as any))) {
          st.lat = last.lat;
          st.lng = last.lng;
          st.fuel = last.fuel;
          (st as any).synced = true;
        }
      }

      let newLat = st.lat;
      let newLng = st.lng;
      let newFuel = st.fuel;

      if (st.fuel > 0) {
        const meters = 15;

        const rad = (st.heading * Math.PI) / 180;
        const dLat = (meters * Math.cos(rad)) / 111_320;
        const dLng = (meters * Math.sin(rad)) / (111_320 * Math.cos(st.lat * Math.PI / 180))

        newLat = st.lat + dLat;
        newLng = st.lng + dLng;

        const turn = (Math.random() * 10 - 5)
        const newHeading = (st.heading + turn + 360) % 360;

        newFuel = Math.max(0, st.fuel - (Math.random() * 0.05))

        st.lat = newLat;
        st.lng = newLng;
        st.fuel = newFuel;
        st.heading = newHeading;
      } else {
        newLat = st.lat;
        newLng = st.lng;
        newFuel = st.fuel;
      }

      let speed = 0;
      if (newFuel > 0) {
        const prevSpeed = last?.speed ?? 30;
        const jitter = prevSpeed + (Math.random() * 6 - 3);
        speed = Math.min(Math.max(jitter, 20), 45);
      }

      const saved = await this.tr.save(
        this.tr.create({
          vehicle: v,
          lat: newLat,
          lng: newLng,
          speed,
          fuel: newFuel,
        }),
      );

      this.liveState.set(v.id, {
        lat: newLat,
        lng: newLng,
        fuel: newFuel,
        heading: st.heading,
      });

      this.ws.emitTelemetry({
        plate: v.plate,
        lat: saved.lat,
        lng: saved.lng,
        speed: saved.speed,
        fuel: saved.fuel,
        timestamp: saved.timestamp,
      });
    }
  }

  async findAll(plate?: string) {
    const vehicles = await this.vr.find({
      order: { plate: 'ASC' },
    });

    const result: any[] = [];

    for (const v of vehicles) {
      const last = await this.tr.findOne({
        where: { vehicle: { id: v.id } },
        order: { timestamp: 'DESC' },
      });

      if (!last) continue;

      result.push({
        id: v.id,
        plate: v.plate,
        lat: last.lat,
        lng: last.lng,
        speed: last.speed,
        fuel: last.fuel,
        timestamp: last.timestamp,
      });
    }

    if (plate) {
      const p = plate.toLowerCase();
      return result.filter((i) =>
        i.plate.toLowerCase().includes(p),
      )
    }

    return result;
  }

  async historyByPlate(plate: string) {
    const v = await this.vr.findOne({ where: { plate } });
    if (!v) return [];

    const hist = await this.tr.find({
      where: { vehicle: { id: v.id } },
      order: { timestamp: 'ASC' },
    });

    return hist.map((h) => ({
      lat: h.lat,
      lng: h.lng,
      timestamp: h.timestamp,
    }));
  }

  async refuelVehicle(plate: string) {
    const v = await this.vr.findOne({ where: { plate } });
    if (!v) {
      throw new HttpException('Veículo não encontrado', HttpStatus.NOT_FOUND);
    }

    const last = await this.tr.findOne({
      where: { vehicle: { id: v.id } },
      order: { timestamp: 'DESC' },
    });

    const lat = last?.lat ?? -8.1163;
    const lng = last?.lng ?? -34.9031;

    const saved = await this.tr.save(
      this.tr.create({
        vehicle: v,
        lat,
        lng,
        speed: 0,
        fuel: 100,
      }),
    );

    const prev = this.liveState.get(v.id);

    this.liveState.set(v.id, {
      lat,
      lng,
      fuel: 100,
      heading: prev?.heading ?? Math.random() * 360,
    });

    this.ws.emitTelemetry({
      plate: v.plate,
      lat: saved.lat,
      lng: saved.lng,
      speed: saved.speed,
      fuel: saved.fuel,
      timestamp: saved.timestamp,
    });

    return { ok: true, plate: v.plate, fuel: 100 };
  }
}
