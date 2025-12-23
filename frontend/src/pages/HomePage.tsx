import Editor from '@/components/Editor';

function HomePage() {
  return (
    <div className="flex flex-col w-full max-h-screen items-center p-2">
      {/* TODO: h1 is a placeholder. To be replaced by document title */}
      <div>
        <h1 className="mx-4 text-4xl font-bold">Untitled</h1>
        <Editor />
      </div>
    </div>
  );
}

export default HomePage;
