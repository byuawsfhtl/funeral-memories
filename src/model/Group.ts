import { Ancestor } from "./Ancestor";

export interface Group {
	groupId: string;
	ancestor: Ancestor;
	portrait: string;
	closed: boolean;
	timestamp: Date;
}
