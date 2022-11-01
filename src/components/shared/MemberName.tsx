import { useMemo, useState } from "react";
import {
  ModelTypeOf,
  ModelCacheInterface,
  useStoreForModel,
} from "../../extend";
import { MemberModel } from "../../models/MemberModel";

export function MemberName(props: {
  memberId: string;
  cache?: ModelCacheInterface<ModelTypeOf<typeof MemberModel>>;
}) {
  const memberStore = useStoreForModel(MemberModel);

  const [member, setMember] = useState<ModelTypeOf<typeof MemberModel> | null>(
    null
  );

  useMemo(() => {
    if (props.cache)
      props.cache.get(props.memberId, (v) => {
        // console.debug("cache setting member", v === member, { v, member });
        setMember(v);
      });
    else memberStore.get(props.memberId).then((v) => setMember(v));
  }, [props.cache, props.memberId, setMember, memberStore]);

  return member ? <>{member.name}</> : <>{props.memberId}</>;
}
