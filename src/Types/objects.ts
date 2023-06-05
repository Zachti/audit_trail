export interface ActionType {
  id: string;
  type: string;
  metadata: Record<string, string | number | boolean>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: string;
}

interface reportedBy {
  id: string;
  name: string;
  internal: boolean;
}

interface HumanReportedBy extends reportedBy {
  email: string;
}

interface ComputerReportedBy extends reportedBy {
  ipAddress: string;
}

export const redisConnection = {
  host: 'localhost',
  port: 6379,
}

export type ReportedBy = HumanReportedBy | ComputerReportedBy;
