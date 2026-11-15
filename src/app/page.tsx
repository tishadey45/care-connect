import Banner from "@/components/ui/Banner";
import Feature from "@/components/ui/Feature";
import Gallery from "@/components/ui/Gallery";
import Newsletter from "@/components/ui/Newsletter";

export default function Home() {
  return (
    <div className="">
     <main>
       <Banner/>
      <Feature/>
      <Gallery/> 
      <Newsletter/>
     </main>
    </div>
  );
}