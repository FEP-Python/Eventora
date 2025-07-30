import { StatsGrid } from "./stats";
import { QuickActions } from "./quick-actions";
import { TaskOverview } from "./task-overview";
import { UpcomingEvents } from "./upcoming-events";
import { BudgetOverview } from "./budget-overview";

export const Dashboard = () => {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#344E41] mb-2">Welcome back to Eventora</h1>
                <p className="text-[#3A5A40]">Here&apos;s what&apos;s happening with your organization today.</p>
            </div>

            <StatsGrid />
  
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>
                <div className="lg:col-span-2">
                    <UpcomingEvents />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TaskOverview />
                <BudgetOverview />
            </div>
        </div>
    );
}
