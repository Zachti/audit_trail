import { ActionType, User, ReportedBy } from '../Types/objects';

export interface Event {
  id: string;
  actionType: ActionType;
  actionSubject: string;
  user: User;
  reportedBy: ReportedBy;
  timestamp: string | Date;
}
