import { Schema } from "mongoose";
import mongoose from "mongoose";
import mongooseAgrregatePaginate from "mongoose-aggregate-paginate-v2";

// we can add directly video and images file using mongodb as such this file should be in less size because the oversize of the data that can be overload the mongodb server for your database

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
      index: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);
videoSchema.plugin(mongooseAgrregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
