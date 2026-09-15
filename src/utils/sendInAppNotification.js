const { getMessaging } = require("firebase-admin/messaging");

/**
 * Send FCM push. All `data` values must be strings (FCM requirement).
 * @param {string[]} fcmTokens
 * @param {string} title
 * @param {string} body
 * @param {string|null} media
 * @param {string} tag - mapped to data.screen
 * @param {string|null} id - mapped to data.id (conversation / entity id)
 * @param {Record<string, string|number|boolean>} [extraData]
 */
const sendInAppNotification = async (
  fcmTokens,
  title,
  body,
  media = null,
  tag = "general",
  id = null,
  extraData = {}
) => {
  try {
    const tokens = (fcmTokens || []).filter(
      (t) => typeof t === "string" && t.trim().length > 0
    );
    if (tokens.length === 0) {
      console.warn("sendInAppNotification: no valid FCM tokens, skipping");
      return;
    }

    const stringData = {};
    for (const [key, value] of Object.entries(extraData || {})) {
      if (value === undefined || value === null) continue;
      stringData[key] = String(value);
    }

    const message = {
      notification: {
        title,
        body: body || "",
      },
      android: {
        notification: {
          ...(media && { imageUrl: media }),
          ...(tag && { tag }),
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          ...(media && { image: media }),
        },
      },
      data: {
        screen: String(tag),
        ...(id != null && id !== "" && { id: String(id) }),
        ...stringData,
      },
    };

    if (tokens.length === 1) {
      const singleMessage = {
        ...message,
        token: tokens[0],
      };
      const response = await getMessaging().send(singleMessage);
      console.log("🚀 ~ Single message sent successfullyy:", response);
    } else {
      message.tokens = tokens;
      const response = await getMessaging().sendEachForMulticast(message);
      console.log("🚀 ~ Multicast message sent successfullyy:", response);

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(
              `🚀 ~ Token at index ${idx} failed with error:`,
              resp.error.message
            );
          }
        });
      }
    }
  } catch (error) {
    console.error("🚀 ~ sendInAppNotification ~ error:", error.message);
  }
};

module.exports = sendInAppNotification;
