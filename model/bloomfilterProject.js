import mongoose from "mongoose";

const bloomfilterProject = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      index: true,  
    },
    type: {
      type: String,
    }
  }
);

export default mongoose.model("bloomfilterProject", bloomfilterProject);
