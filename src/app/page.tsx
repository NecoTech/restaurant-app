import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center   justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Welcome to our Restaurant App</h1>
        <p className="mt-3 text-2xl">Choose a restaurant to view its menu:</p>
        <div className="mt-6 w-screen flex flex-wrap items-center justify-evenly">
          <Link
            href="/restaurant/rest001"
            className="mx-2 px-4 py-2 rounded bg-blue-500 text-white"
          >
            Restaurant 1
          </Link>
          <Link
            href="/restaurant/rest002"
            className="mx-2 px-4 py-2 rounded bg-green-500 text-white"
          >
            Restaurant 2
          </Link>
        </div>
      </main>
    </div>
  );
}
