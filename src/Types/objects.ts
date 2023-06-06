export interface ActionType {
  id: string;
  type: string;
  metadata: Record<string, string | number | boolean>;
}

export interface RedisOpts {
  port?: number;
  host?: string;
  db?: number;
  password?: string;
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

export type ReportedBy = HumanReportedBy | ComputerReportedBy;

