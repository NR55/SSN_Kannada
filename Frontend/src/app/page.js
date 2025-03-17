export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Learn Kannada Alphabets</h1>
      <p className="text-lg">Practice writing Kannada letters and get feedback!</p>
      <a
        href="/learn"
        className="mt-4 px-6 py-3 bg-blue-500 text-white text-lg rounded-lg"
      >
        Start Learning
      </a>
    </div>
  );
}
