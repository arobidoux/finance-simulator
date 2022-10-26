import { createModel } from "../extend";

export const MemberModel = createModel({
  name: "member",
  sample: () => {
    return {
      name: "John Smith",
    };
  },
});
