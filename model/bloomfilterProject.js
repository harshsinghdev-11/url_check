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
      required: true
    }
  }
);

export default mongoose.model("bloomfilterProject", bloomfilterProject);
