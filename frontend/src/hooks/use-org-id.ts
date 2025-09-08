import { useParams } from "next/navigation";

export const useOrgId = () => {
    const params = useParams();

    return params.orgId as string;
}
