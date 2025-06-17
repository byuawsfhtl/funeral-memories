export interface Memory {
	_id: string;
	groupId: string;
	title: string;
	memory: string;
	place: string;
	date: string;
	image: string | null;
	author: string;
	createdAt: Date;
	sessionId: string;
}
