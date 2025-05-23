import Link from "next/link";

export default function Home() {
  return (
    <div className="grid items-center justify-items-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="font-bold text-4xl m-2">
        Discover your next star Beauty Ingredients, today
      </h1>
      <p>
        Our AI identifies trending and viral beauty ingredients on TikTok,
        Instagram, and YouTube. Get data-backed insights and actionable
        summaries to launch your products ahead of the curve.
      </p>
      <div className="flex justify-between">
        <Link
          className="border p-2 mx-2 rounded bg-indigo-600"
          href="/ingredient-finder"
        >
          Find Ingredients
        </Link>
        <Link
          className="border p-2 mx-2 rounded bg-indigo-600"
          href="/ingredient-deep-search"
        >
          Research an Ingredient
        </Link>
      </div>
    </div>
  );
}
