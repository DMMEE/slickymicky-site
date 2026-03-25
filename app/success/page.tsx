type SuccessPageProps = {
  searchParams: Promise<{
    type?: string;
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const type = params?.type ?? "single";

  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>Payment successful</h1>
      <p>
        {type === "sub"
          ? "Your subscription is now active."
          : "Your payment was successful."}
      </p>
    </main>
  );
}