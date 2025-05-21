import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1>Ingredient Navigator</h1>
      <div className="flex justify-between">
        <Link className="border p-2 mx-2 rounded" href="/ingredient-finder">
          Find Ingredients
        </Link>
        <Link
          className="border p-2 mx-2 rounded"
          href="/ingredient-deep-search"
        >
          Research an Ingredient
        </Link>
      </div>
    </div>
  );
}
