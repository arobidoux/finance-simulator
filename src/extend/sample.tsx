import { useContext } from "react";
import { createModel, useModel } from "./Model";
import { StoreContext, InMemoryStore } from "./StoreContext";

// TODO export function useModelList<T, P>(
//     model: CreatedModel<T, P>,
//   ):  {
//   }

/**
 * Sample
 */

const memberModel = createModel({
  name: "member",
  sample: () => {
    return {
      name: "John Smith",
      email: "johnsmith@exemple.com",
    };
  },
}).$migrate({
  sample: (prev) => {
    return { ...prev, gender: "male" };
  },
  migrate: (old) => {
    return { ...old, gender: "unkown" };
  },
});

export function SampleComponent() {
  const { entry: member, ...$member } = useModel(memberModel);
  console.log($member.hasChanges());
}

export function SampleWithSpecialize() {
  const storeContext = useContext(StoreContext);
  const specialized = storeContext.specialize(memberModel, new InMemoryStore());
  return <StoreContext.Provider value={specialized}></StoreContext.Provider>;
}
