import { Dashboard } from "@/components/dashboard"
import { OrganizationGuard } from "@/components/dashboard/organization/org-guard"

const OrgIdPage = () => {
    return (
        <OrganizationGuard>
            <Dashboard />
        </OrganizationGuard>
    )
}

export default OrgIdPage;
