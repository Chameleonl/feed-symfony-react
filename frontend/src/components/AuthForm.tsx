import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getJwt, loginUser, registerUser } from "@/utils/helpers";
import { useState } from "react";
import { toast } from "sonner";

export default function AuthForm({ message }: { message: string }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (message === "Log In") {
				await loginUser(username.toLowerCase(), password);
			} else {
				const result = await registerUser(username.toLowerCase(), password);
				if (!("error" in result)) {
					toast.success("Registered successfully.");
				}
			}
		} catch (err: any) {
			toast.error(err.message);
		}

		if (getJwt()) {
			window.location.href = "/";
		}
	};

	return (
		<Dialog>
			<form>
				<DialogTrigger asChild>
					<Button>{message}</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{message}</DialogTitle>
						<DialogDescription>
							{message === "Log In"
								? "Enter your credentials to access your account."
								: "Fill in the form to create a new account."}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="username">Username</Label>
							<Input id="username" name="username" onChange={(e) => setUsername(e.target.value)} />
						</div>
						<div className="grid gap-3">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								name="password"
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button>Cancel</Button>
						</DialogClose>
						<Button type="submit" onClick={handleSubmit}>
							{message}
						</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
