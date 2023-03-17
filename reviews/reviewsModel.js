import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewsSchema = new Schema(
  {
    comment: { type: String, reqired: true },
    rate: {
      type: Number,
      reqired: true,
      min: [0, "Min rating 0!"],
      max: [5, "Max rating 5! :)"],
    },
  },
  { timestamps: true }
);
export default model("reviews", reviewsSchema);
