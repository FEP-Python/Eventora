import { EventEditForm } from "@/components/dashboard/events/event-edit-form";

interface EventEditPageProps {
    params: Promise<{
        orgId: string,
        eventId: string,
    }>
}

const EventEditPage = async ({ params }: EventEditPageProps) => {
    const { orgId, eventId } = await params;

    return <EventEditForm orgId={Number(orgId)} eventId={Number(eventId)} />
}

export default EventEditPage;
