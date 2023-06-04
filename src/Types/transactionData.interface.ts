import {ActionType, ReportedBy, User} from "./objects";

export interface TransactionData {
    actionType: ActionType;
    actionSubject: string;
    user: User;
    reportedBy: ReportedBy;
    timestamp?: string | Date;
}