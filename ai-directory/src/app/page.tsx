import DirectoryHome from "@/components/DirectoryHome";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = (await searchParams) ?? {};
  const initialQuery = typeof sp.q === "string" ? sp.q : "";
  const initialSort = sp.sort === "new" || sp.sort === "name" ? sp.sort : "hot";
  const initialPrice = sp.price === "免费" || sp.price === "付费" || sp.price === "免费试用" ? sp.price : "all";
  const initialCategory = typeof sp.category === "string" ? sp.category : "全部";

  return (
    <DirectoryHome
      initialQuery={initialQuery}
      initialSort={initialSort}
      initialPrice={initialPrice}
      initialCategory={initialCategory}
    />
  );
}
