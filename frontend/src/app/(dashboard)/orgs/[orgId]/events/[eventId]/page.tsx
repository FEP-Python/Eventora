import { EventDetails } from "@/components/dashboard/events/event-details";

interface EventIdPageProps {
    params: Promise<{
        orgId: string,
        eventId: string,
    }>
}

const EventIdPage = async ({ params }: EventIdPageProps) => {
    const { orgId, eventId } = await params;

    return <EventDetails orgId={Number(orgId)} eventId={Number(eventId)} />
}

export default EventIdPage;