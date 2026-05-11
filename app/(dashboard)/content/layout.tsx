import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Títulos e legendas — Open Studio",
  description: "Generate title candidates and captions for creator content packages.",
  openGraph: {
    title: "Títulos e legendas — Open Studio",
    description: "Generate title candidates and captions for creator content packages.",
  },
  twitter: {
    title: "Títulos e legendas — Open Studio",
    description: "Generate title candidates and captions for creator content packages.",
  },
};

export default function ContentToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
