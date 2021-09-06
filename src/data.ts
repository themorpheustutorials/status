export interface Namespace {
  id: string;
  name: string;
  services: ServiceQuery[];
}

export interface ServiceQuery {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  url: string;
  method: string;
  status: number;
}

export interface ServiceData {
  id: string;
  ping: PingData[];
  incidents: IncidentData[];
}

export interface PingData {
  date: string;
  lastPing?: number;
  ping?: number[];
  pingAvg?: number;
  operational: boolean;
  location: string;
}

export interface IncidentData {
  startTime: string;
  endTime?: string;
}

export interface CronResponse {
  id: string;
  ping: PingData;
}
