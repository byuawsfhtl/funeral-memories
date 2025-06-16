import { ObjectId } from "mongodb";

export interface Memory {
	_id: ObjectId;
	groupId: string;
	title: string;
	memory: string;
	place: string;
	date: string;
	image: string | null;
	author: string;
	createdAt: string;
	sessionId: string;
}
