import { syncTwilioMessages } from "./helpers/twilioMessagesSync";

(async () => {
  try {
    await syncTwilioMessages();
    console.log("Message sync completed successfully.");
  } catch (error) {
    console.error("Error syncing messages:", error);
  }
})();
