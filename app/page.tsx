import dynamic from “next/dynamic”;

const BagTrackerApp = dynamic(() => import(”./BagTrackerApp”), { ssr: false });

export default function Page() {
return <BagTrackerApp />;
}
