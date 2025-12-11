const cron = require("node-cron");
const moment = require("moment-timezone");
const Promotions = require("../models/promotionModel");

cron.schedule("0 0 * * *", async () => {
    try {
        const now = moment().tz("Asia/Kolkata");
        const progress_promo = await Promotions.find({
            status: "inactive",
            startDate: { $lte: now.toDate() },
        });
        console.log("progress_promo count", progress_promo.length);
        if (progress_promo.length > 0) {
            await Promise.all(
                progress_promo.map(async (promo) => {
                    promo.status = "active";
                    await promo.save();
                })
            );
            console.log(`Updated ${progress_promo.length} promos to active`);
        }
        const done_promo = await Promotions.find({
            status: "active",
            endDate: { $lte: now.toDate() },
        });
        console.log("done_promo count", done_promo.length);
        if (done_promo.length > 0) {
            await Promise.all(
                done_promo.map(async (promo) => {
                    promo.status = "expired";
                    await promo.save();
                })
            );
            console.log(`Updated ${done_promo.length} promos to expired`);
        }
    } catch (error) {
        console.error("Error updating promotion status", error);
    }
});
