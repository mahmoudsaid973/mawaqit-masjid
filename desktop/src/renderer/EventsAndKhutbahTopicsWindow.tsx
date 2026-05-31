import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function EventsAndKhutbahTopicsWindow() {
  const { data: session } = useSession();
  const [topics, setTopics] = useState<Array<{ id: string; title: string; date: string; }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // In a real app, this would fetch from an API
        // For this example, we'll use mock data
        const mockTopics = [
          { id: '1', title: 'Friday Prayer', date: '2023-10-06' },
          { id: '2', title: 'Ramadan Preparation', date: '2023-10-15' },
        ];
        setTopics(mockTopics);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Access Denied. Please log in.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Events and Khutbah Topics</h1>
      <ul className="space-y-4">
        {topics.map((topic) => (
          <li key={topic.id} className="p-4 bg-white shadow rounded-md">
            <h2 className="text-xl font-semibold">{topic.title}</h2>
            <p className="text-gray-600">Date: {topic.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
