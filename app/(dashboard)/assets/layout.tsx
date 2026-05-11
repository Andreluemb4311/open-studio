import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assets Library — Open Studio",
  description: "Save and manage generated scripts, thumbnails, prompts and content packages",
  openGraph: {
    title: "Assets Library — Open Studio",
    description: "Save and manage generated scripts, thumbnails, prompts and content packages",
    type: "website",
    siteName: "Open Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assets Library — Open Studio",
    description: "Save and manage generated scripts, thumbnails, prompts and content packages",
  },
};

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
