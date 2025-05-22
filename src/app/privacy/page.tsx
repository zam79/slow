import { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Drugbit.info",
  description: "Read our privacy policy to understand how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow px-4 py-10 bg-white text-gray-900">
        <section className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg leading-relaxed">
            At Drugbit.info, we value your privacy. This policy outlines how we
            collect, use, and protect your data.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
