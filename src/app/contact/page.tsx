import { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Contact | Drugbit.info",
  description: "Get in touch with the Drugbit.info team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow px-4 py-10 bg-white text-gray-900">
        <section className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg">Email: support@drugbit.info</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

