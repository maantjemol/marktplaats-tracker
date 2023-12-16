import { json } from '@sveltejs/kit';
import webPush from 'web-push';
import type { RequestEvent } from './$types';
import { VAPID_CONTACT, VAPID_PRIVATE, VAPID_PUBLIC } from '$env/static/private';
import { PrismaClient } from '@prisma/client';

export async function POST({ request }: RequestEvent) {
	webPush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC, VAPID_PRIVATE);

	const body: { id: string } = await request.json();
	const prisma = new PrismaClient();

	if (body.id) {
		const user = await prisma.marktplaats_users.findUnique({
			where: {
				id: Number(body.id)
			}
		});

		if (!user) {
			return json({ ok: false, error: 'User not found' });
		}

		const subscription = user.subscription as unknown as webPush.PushSubscription;

		// Send notification
		const result = await webPush.sendNotification(subscription, 'hello world');

		console.log(result);

		return json({ ok: true, result });
	}

	const users = await prisma.marktplaats_users.findMany();

	users.forEach(async (user) => {
		const subscription = user.subscription as unknown as webPush.PushSubscription;

		// Send notification
		const result = await webPush.sendNotification(subscription, `hello world ${user.name}`);

		console.log(result);
	});

	return json({ ok: true });
}

// Sends the public key back to the client for registration
export function GET() {
	return json({
		key: VAPID_PUBLIC
	});
}
