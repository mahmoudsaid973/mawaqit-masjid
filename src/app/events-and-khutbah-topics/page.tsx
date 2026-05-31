import { Metadata } from 'next';
import { EventCard } from '@/components/events/event-card';
import { KhutbahTopicList } from '@/components/khutbah/khutbah-topic-list';
import { EventService } from '@/services/event-service';
import { KhutbahTopicService } from '@/services/khutbah-topic-service';
import { InferGetServerSidePropsType } from 'next';
import { Event } from '@/services/event-service';

export const metadata: Metadata = {
  title: 'Events & Khutbah Topics | Admin Portal',
  description: 'Manage upcoming community events and curated Khutbah topics.',
};

export async function getServerSideProps() {
  let upcomingEvents: any[] = [];
  let khutbahTopics: any[] = [];
  let errorBoundary: string | null = null;

  try {
    [upcomingEvents, khutbahTopics] = await Promise.all([
      EventService.getUpcomingEvents(),
      KhutbahTopicService.getRecentTopics(),
    ]);
  } catch (err) {
    const safeMessage = err instanceof Error ? err.message : String(err);
    errorBoundary = `Failed to load dashboard data: ${safeMessage}`;
  }

  return {
    props: {
      upcomingEvents,
      khutbahTopics,
      errorBoundary,
    },
  };
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function EventsAndKhutbahTopicsPage({ 
  upcomingEvents, 
  khutbahTopics, 
  errorBoundary 
}: Props) {
  if (errorBoundary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-red-700">Data Unavailable</h2>
          <p className="text-gray-600">{errorBoundary}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Events & Khutbah Topics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of upcoming community gatherings and sermon resources.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Export Calendar
            </button>
            <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              + New Event
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Upcoming Events</h2>
              <a href="/admin/events" className="text-sm font-medium text-indify-600 hover:text-indigo-500">
                View all <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            
            {upcomingEvents.length === 0 ? (
              <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
                <p className="text-sm text-gray-500">No upcoming events scheduled.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcomingEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Recent Khutbah Topics</h2>
              <a href="/admin/khutbah" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Manage topics <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <KhutbahTopicList topics={khutbahTopics} />
            </div>
            
            <div className="mt-6 rounded-lg bg-indigo-50 p-4">
              <h3 className="text-sm font-medium text-indigo-800">Topic Suggestion</h3>
              <p className="mt-1 text-sm text-indigo-700">
                Review the "Community Wellness" series for next month's scheduled sermons.
              </p>
              <button className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                Review Series &rarr;
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}