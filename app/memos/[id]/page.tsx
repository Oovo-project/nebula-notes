import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LegacyMemoRoute({ params }: Props) {
  const { id } = await params;
  redirect(`/memo/${id}`);
}
