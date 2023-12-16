<script lang="ts">
	import { onMount } from "svelte";
  import { dev } from '$app/environment';

  let PushSubscription:PushSubscriptionJSON | null = null;
  let username = "";

  // Create user
  const createUser = async () => {
    if (PushSubscription && PushSubscription.keys) {
      if (!username) {
        alert("Please enter a username");
        return;
      }
      if (username.length > 20) {
        alert("Username must be less than 20 characters");
        return;
      }
      if (username.length < 3) {
        alert("Username must be more than 3 characters");
        return;
      }
      if (!username.match(/^[a-zA-Z0-9]+$/)) {
        alert("Username must only contain letters and numbers");
        return;
      }
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: username,
          subscription: {
            endpoint: PushSubscription.endpoint,
            keys: {
              auth: PushSubscription.keys.auth,
              p256dh: PushSubscription.keys.p256dh
            }
          }
         })
      });
      console.log(await res.json());
    } else {
      alert("Please allow notifications to make sure that the application works.");
    }
  }

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
  // const sendNotification = async () => {
  //   if (!PushSubscription) {
  //     alert("Please allow notifications to make sure that the application works.");
  //     return;
  //   };

  //   const res = await fetch("/api/notification", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify(PushSubscription)
  //   });
  //   console.log(await res.json());
  // }

</script>
<h1>Create user</h1>
<input type="text" bind:value={username}>
<button on:click={createUser}>Create user</button>