import Feed from "@/components/Feed";
import { Toaster } from "@/components/ui/sonner";

function App() {
	return (
		<>
			<Feed />
			<Toaster position="bottom-center" richColors closeButton />
		</>
	);
}

export default App;

