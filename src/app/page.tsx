import Content from "@/components/container/Content";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navigation/Navbar";

export default function Home() {
  return (
    <main className="h-screen justify-between relative flex flex-col">
      <div className="flex-1">
        <Navbar />
        <Content />
      </div>
      <Footer />
    </main>
  );
}
