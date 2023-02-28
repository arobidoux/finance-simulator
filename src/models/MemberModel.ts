import { createModel, ModelTypeOf } from "../extend";

export const MemberModel = createModel({
  name: "member",
  sample: () => {
    return {
      name: "John Smith",
    };
  },
});

export type MemberType = ModelTypeOf<typeof MemberModel>;
