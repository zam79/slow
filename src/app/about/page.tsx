import { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "About | Drugbit.info",
  description: "Learn more about Drugbit.info and our mission.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow px-4 py-10 bg-white text-gray-900">
        <section className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            About Drugbit.info
          </h1>
          <p className="text-lg leading-relaxed">
            Drugbit.info is dedicated to providing detailed drug information for
            anesthesia and critical care professionals.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
