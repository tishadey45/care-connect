import Banner from "@/components/ui/Banner";
import Feature from "@/components/ui/Feature";
import Gallery from "@/components/ui/Gallery";
import Newsletter from "@/components/ui/Newsletter";

export default function Home() {
  return (
    <div className="">
      <Banner/>
      <Feature/>
      <Gallery/> 
      <Newsletter/>
    </div>
  );
}