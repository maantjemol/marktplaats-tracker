<script lang="ts">
	import { onMount } from "svelte";
  import { dev } from '$app/environment';

  let PushSubscription:PushSubscriptionJSON | null = null;

  // Register service worker and request notification permission
  onMount(async () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register('/service-worker.js', {
        type: dev ? 'module' : 'classic'
      });
    }

    const status = await Notification.requestPermission();
    if (status !== "granted")
      alert(
        "Please allow notifications to make sure that the application works."
      );
    
    const reg = await navigator.serviceWorker.ready;
    const resp = await fetch("/api/notification")
    const publicKey:{key: string} = await resp.json();

    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey.key });
    const subJson = sub.toJSON();
    PushSubscription = subJson;
  });

  // Send notification to the server
  const sendNotification = async () => {
    if (!PushSubscription) {
      alert("Please allow notifications to make sure that the application works.");
      return;
    };

    const res = await fetch("/api/notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(PushSubscription)
    });
    console.log(await res.json());
  }

</script>
<h1>Click the button below to send a notification</h1>
<button on:click={() => sendNotification()}>Send Notification</button>