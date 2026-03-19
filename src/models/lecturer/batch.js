const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        batchId: {
            type: String,
            required: true,
        },
        batchName: {
            type: String,
            required: true,
        },
        batchYear: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

batchSchema.index({ userId: 1, batchId: 1 });
batchSchema.index({ userId: 1, batchYear: 1 });
batchSchema.index({ userId: 1, batchName: 1 });
batchSchema.index({ userId: 1, _id: -1 });

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;
