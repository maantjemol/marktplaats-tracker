import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { Prisma, PrismaClient } from '@prisma/client';
export type User = {
	id?: string;
	name: string;
	subscription: Subscription;
};

export type Subscription = {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
};

export async function POST({ request }: RequestEvent) {
	const body = (await request.json()) as User;
	const prisma = new PrismaClient();

	if (!body.name || !body.subscription) {
		return json({ ok: false });
	}

	const subscription = {
		endpoint: body.subscription.endpoint,
		keys: {
			p256dh: body.subscription.keys.p256dh,
			auth: body.subscription.keys.auth
		}
	} as Prisma.JsonObject;

	const resp = await prisma.marktplaats_users.create({
		data: {
			name: body.name,
			subscription: subscription
		}
	});

	return json({ ok: true, id: resp.id, name: resp.name, subscription: resp.subscription });
}

// Sends the public key back to the client for registration
export async function GET({ url }: RequestEvent) {
	// get id from url
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ ok: false });
	}

	const prisma = new PrismaClient();

	const resp = await prisma.marktplaats_users.findUnique({
		where: {
			id: Number(id)
		}
	});

	if (!resp) {
		return json({ ok: false });
	}

	return json({
		name: resp.name,
		id: resp.id,
		ok: true
	});
}
